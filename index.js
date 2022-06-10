const database = require('./database');

const { ApolloServer, gql } = require('apollo-server');

// typeDef : GrqphQL 명세에서 사용될 데이터, 요청의 타입 지정
// gpl : template literal tag, gpl로 생성한다.
const typeDefs = gql`
  type Query {
    teams: [Team]
    equipments: [Equipment]
    supplies: [Supply]
  }
  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
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
    // database의 teams를 모두 반환하는 함수
    teams: () => database.teams,
    equipments: () => database.equipments,
    supplies: () => database.supplies,
  },
};

// ApolloServer : typeDef와 resolvers를 인자로 받아 서버 생성
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
