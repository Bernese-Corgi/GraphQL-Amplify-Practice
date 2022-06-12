# GraphQL 서버 깊이 파기

해당 저장소는 [얄팍한 GraphQL & Apollo 강좌](https://www.yalco.kr/lectures/graphql-apollo/)를 통해 실습한 예제입니다.

## 서버 파일 모듈화하기

typeDef와 resolvers에 다수의 모듈을 전달할 때는 배열로 전달한다. [(Apollo server API docs)](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#options)

- typeDefs: 단일 변수 또는 배열로 지정 가능
- resolvers: 단일 Object 또는 Merge 된 배열로 가능

### 모듈화 작업

**↓ 모듈화 전 index 파일**

```javascript
const typeDefs = gql`
  type Query {
    equipments: [Equipment]
    supplies: [Supply]
  }
  type Mutation {
    deleteEquipment(id: String): Equipment
    deleteSupply: [Supply]
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

const resolvers = {
  Query: {
    equipments: () => database.equipments,
    supplies: () => database.supplies,
  },
  Mutation: {
    deleteEquipment: (parent, args) => dbWorks.deleteItem('equipments', args),
    deleteSupply: (parent, args) => dbWorks.deleteItem('supplies', args),
  },
};
```

이렇게 한 파일에 정리되어 있는 typeDef와 resolvers를 각각의 파일로 분리하여 모듈화할 수 있다.

src 폴더 내부에 typedefs-resolvers 폴더를 생성한 뒤, typeDef와 resolvers를 정의하는 파일을 분리하여 설정한다. 파일의 구조는 다음과 같다.

```bash
typedefs-resolvers
├── _mutations.js
├── _queries.js
├── equipments.js
└── supplies.js
```

**1. equipments와 supplies 모듈 정의**

🔻 typedefs-resolvers/equipments.js

```javascript
const { gql } = require('apollo-server');
const dbWorks = require('../dbWorks');

const typeDefs = gql`
  type Equipment {
    id: String
    used_by: String
    count: Int
    new_or_used: String
  }
`;

const resolvers = {
  Query: {
    equipments: (parent, args) => dbWorks.getEquipments(args),
  },
  Mutation: {
    deleteEquipment: (parent, args) => dbWorks.deleteItem('equipments', args),
  },
};

module.exports = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
```

🔻 typedefs-resolvers/supplies.js

```javascript
const { gql } = require('apollo-server');
const dbWorks = require('../dbWorks');

const typeDefs = gql`
  type Supply {
    id: String
    team: Int
  }
`;

const resolvers = {
  Query: {
    supplies: (parent, args) => dbWorks.getSupplies(args),
  },
  Mutation: {
    deleteSupply: (parent, args) => dbWorks.deleteItem('supplies', args),
  },
};

module.exports = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
```

**2. queries와 mutations 정의하기**

위에서 생성한 equipments, supplies 모듈을 각각 `_queries`와 `_mutations`에 적용한다.

🔻 typedefs-resolvers/\_queries.js

```javascript
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    equipments: [Equipment]
    supplies: [Supply]
  }
`;

module.exports = typeDefs;
```

🔻 typedefs-resolvers/\_mutations.js

```javascript
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Mutation {
    deleteEquipment(id: String): Equipment
    deleteSupply: [Supply]
  }
`;

module.exports = typeDefs;
```

**3. index 파일의 서버 생성자에 인수 전달하기**

각각의 모듈에 정의된 typeDef와 resolvers를 배열로 담아서 `ApolloServer` 생성자 함수에 전달한다.

```javascript
const { ApolloServer } = require('apollo-server');
const _ = require('lodash');

const queries = require('./typedefs-resolvers/_queries');
const mutations = require('./typedefs-resolvers/_mutations');
const equipments = require('./typedefs-resolvers/equipments');
const supplies = require('./typedefs-resolvers/supplies');

const typeDefs = [queries, mutations, equipments.typeDefs, supplies.typeDefs];

const resolvers = [equipments.resolvers, supplies.resolvers];

const server = new ApolloServer({ typeDefs, resolvers });
```

## GraphQL의 자료형

### 스칼라 타입

GraphQL 내장 자료형

| 타입    | 설명                                                 |
| ------- | ---------------------------------------------------- |
| ID      | 기본적으로는 String이나, 고유 식별자 역할임을 나타냄 |
| String  | UTF-8 문자열                                         |
| Int     | 부호가 있는 32비트 정수                              |
| Float   | 부호가 있는 부동소수점 값                            |
| Boolean | 참/거짓                                              |

`!` : Non Null, null을 반환할 수 없음

<details>
<summary>예제</summary>
<div markdown="1">

```javascript
type EquipmentAdv {
  id: ID!
  used_by: String!
  count: Int!
  use_rate: Float
  is_new: Boolean!
}
```

equipments.js

use_rate와 is_new는 equipments의 타입에 없기 때문에 값을 지정해야 한다.

```javascript
const resolvers = {
  Query: {
    // ...
    equipmentAdvs: (parent, args) =>
      dbWorks.getEquipments(args).map(equipment => {
        if (equipment.used_by === 'developer') {
          equipment.use_rate = Math.random().toFixed(2);
        }
        equipment.is_new = equipment.new_or_used === 'new';
        return equipment;
      }),
  },
  // ...
};
```

\_queries.js

```javascript
type Query {
  ...
  equipmentAdvs: [EquipmentAdv]
  ...
}
```

↓ 쿼리 요청

```javascript
query {
  equipmentAdvs {
    id
    used_by
    count
    use_rate
    is_new
  }
}
```

</div>
</details>
