import { ApolloServer, gql } from "apollo-server";

const tweets = [
  { id: '1', text: 'hello 1' },
  { id: '2', text: 'hello 2' },
  { id: '3', text: 'hello 3' },
  { id: '4', text: 'hello 4' },
]

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
  }

  type Tweet {
    id: ID!
    text: String!
    author: User
  }

  # 루트 타입 : 타입들의 집합
  type Query {
    allTweets: [Tweet!] # /tweets
    tweet(id: ID!): Tweet # /tweet/:id 라고 생각할 수 있다.
  }

  # 뮤테이션
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet
    deleteTweet(id: ID!): Boolean
  }
`

const resolvers = {
  // 타입 정의와 같은 형태를 가져야한다.
  Query: {
    allTweets() {
      return tweets
    },
    tweet(root, { id }) {
      return tweets.find(tweet => tweet.id === id)
    },
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
})