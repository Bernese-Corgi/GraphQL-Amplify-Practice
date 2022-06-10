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
    team: (parent, args, context, info) =>
      // [0] -> 배열 내부의 첫번째 요소를 반환 (filter로 배열 요소를 하나만 받아오도록 설정했으므로 첫번째 요소만 반환하면 됨)
      database.teams.filter(team => team.id === args.id)[0],
    equipments: () => database.equipments,
    supplies: () => database.supplies,
  },
  Mutation: {
    deleteEquipment: (parent, args, context, info) => {
      const deleted = database.equipments.filter(equipment => {
        return equipment.id === args.id;
      })[0];
      database.equipments = database.equipments.filter(equipment => {
        return equipment.id !== args.id;
      });
      return deleted;
    },
    insertEquipment: (parent, args, context, info) => {
      database.equipments.push(args);
      return args;
    },
    editEquipment: (parent, args, context, info) => {
      return database.equipments
        .filter(equipment => {
          return equipment.id === args.id;
        })
        .map(equipment => {
          Object.assign(equipment, args);
          return equipment;
        })[0];
    },
  },
};

// ApolloServer : typeDef와 resolvers를 인자로 받아 서버 생성
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
