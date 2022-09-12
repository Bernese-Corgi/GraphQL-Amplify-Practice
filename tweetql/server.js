import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  # 루트 타입 : 타입들의 집합
  type Query {
    text: String # 엔드포인트를 노출시키는 것과 같다.
    hello: String
  }
`

const server = new ApolloServer({ typeDefs })

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
})