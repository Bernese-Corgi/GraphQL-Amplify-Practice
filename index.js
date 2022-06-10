const database = require('./database');

const { ApolloServer, gql } = require('apollo-server');

// typeDef : GrqphQL 명세에서 사용될 데이터, 요청의 타입 지정
// gpl : template literal tag, gpl로 생성한다.
const typeDefs = gql`
  type Query {
    teams: [Team]
    team(id: Int): Team
    equipments: [Equipment]
    supplies: [Supply]
  }
  type Mutation {
    deleteEquipment(id: String): Equipment
    insertEquipment(
      id: String
      used_by: String
      count: Int
      new_or_used: String
    ): Equipment
    editEquipment(
      id: String
      used_by: String
      count: Int
      new_or_used: String
    ): Equipment
  }
  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
    supplies: [Supply]
  }
  type Equipment {
    id: String
    used_by: String
    count: Int
    new_or_used: String
  }
  type Supply {
    id: String
    team: Int
  }
`;

// resolvers : 서비스의 액션들을 함수로 지정. 요청에 따라 데이터를 반환, 입력, 수정, 삭제한다.
const resolvers = {
  Query: {
    // team에 supplies 연결해서 받아오기
    teams: () =>
      database.teams.map(team => {
        team.supplies = database.supplies.filter(
          supply => supply.team === team.id
        );
        return team;
      }),
    // 특정 데이터 받아오기
    team: (parent, args, context, info) =>
      // [0] -> 배열 내부의 첫번째 요소를 반환 (filter로 배열 요소를 하나만 받아오도록 설정했으므로 첫번째 요소만 반환하면 됨)
      database.teams.filter(team => team.id === args.id)[0],
    equipments: () => database.equipments,
    supplies: () => database.supplies,
  },
  Mutation: {
    // 데이터 삭제
    deleteEquipment: (parent, args, context, info) => {
      const deleted = database.equipments.filter(equipment => {
        return equipment.id === args.id;
      })[0];
      database.equipments = database.equipments.filter(equipment => {
        return equipment.id !== args.id;
      });
      return deleted;
    },
    // 데이터 추가
    insertEquipment: (parent, args, context, info) => {
      database.equipments.push(args);
      return args;
    },
    // 데이터 수정
    editEquipment: (parent, args, context, info) =>
      database.equipments
        // id가 일치하는 데이터만 필터링
        .filter(equipment => equipment.id === args.id)
        .map(equipment => {
          // 새로 작성된 arg 데이터를 할당 (수정 작업)
          Object.assign(equipment, args);
          return equipment;
        })[0],
  },
};

// ApolloServer : typeDef와 resolvers를 인자로 받아 서버 생성
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
