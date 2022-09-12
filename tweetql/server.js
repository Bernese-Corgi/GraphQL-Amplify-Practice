import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  type User {
    id: ID
    username: String
  }

  type Tweet {
    id: ID
    text: String
    author: User
  }

  # 루트 타입 : 타입들의 집합
  type Query {
    allTweets: [Tweet] # /tweets
    tweet(id: ID): Tweet # /tweet/:id 라고 생각할 수 있다.
  }

  # 뮤테이션
  type Mutation {
    postTweet(text: String, userId: ID): Tweet
    deleteTweet(id: ID): Boolean
  }
`

const server = new ApolloServer({ typeDefs })

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
})