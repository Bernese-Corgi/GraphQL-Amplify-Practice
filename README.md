# GraphQL과 Apollo 라이브러리를 활용해 서비스를 구현하는 실습

해당 저장소는 [얄팍한 GraphQL & Apollo 강좌](https://www.yalco.kr/lectures/graphql-apollo/)를 통해 실습한 예제입니다.

## GraphQL Playground

- 작성한 GraphQL type, resolve 명세를 확인
- 데이터 요청 및 전송 테스트 가능

## Query 구현하기

### Type 지정하기

**typeDef**

- GraphQL 명세에서 사용될 데이터, 요청의 타입 지정
- gpl<span style="color: gray">(template literal tag)</span>로 생성한다.

```js
const typeDefs = gql`
  type Query {
    teams: [Team]
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
`;
```

**Query 루트 타입**

- 자료 요청에 사용될 쿼리들을 정의한다.
- 쿼리 명령문마다 반환될 데이터 형태를 지정한다.

```js
const typeDefs = gql`
  type Query { // 쿼리 루트 타입
    teams: [Team]
  }
`;
```

**Type 지정하기**

- 반환될 데이터의 형태를 지정
- 자료형을 가진 필드들로 구성

```js
const typeDefs = gql`
  // ...
  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
  }
`;
```

### resolver

- Query란 object의 항목들로 데이터를 반환하는 함수 선언
- 실제 프로젝트에서는 MySQL 조회 코드 등..

```js
const resolvers = {
  Query: {
    // database의 teams를 모두 반환하는 함수
    teams: () => database.teams,
  },
};
```

### 데이터 반환하는 쿼리 만들기

**1. 타입 정의 작성**

```js
const typeDefs = gql`
  // ...
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
```

**2. 다수의 equipment, supplies를 반환하는 쿼리**

```js
const typeDefs = gql`
  type Query {
    // ...
    equipments: [Equipment]
    supplies: [Supply]
  }
  // ...
```

**3. 데이터베이스에서 equipments를 추출하여 반환하는 resolver**

```js
const resolvers = {
  Query: {
    // ...
    equipments: () => database.equipments,
    supplies: () => database.supplies,
  },
};
```

**4. 플레이그라운드에서 쿼리 요청해보기**

```
query {
  equipments {
    id
    used_by
    count
    new_or_used
  }
}
```

![](https://user-images.githubusercontent.com/72931773/173052846-ae4664b4-d30c-4497-b7ad-40426717f4f4.png)

또는

```
query {
  supplies {
    id
    team
  }
}
```

![](https://user-images.githubusercontent.com/72931773/173052873-6364ecd1-1524-42b1-bde6-26755accfa8f.png)

### 특정 데이터를 반환하는 쿼리 만들기

```js
const typeDefs = gql`
  type Query {
    // ...
    team(id: Int): Team
  }
  // ...
`;

// resolvers : 서비스의 액션들을 함수로 지정. 요청에 따라 데이터를 반환, 입력, 수정, 삭제한다.
const resolvers = {
  Query: {
    // ...
    team: (parent, args, context, info) =>
      // [0] -> 배열 내부의 첫번째 요소를 반환 (filter로 배열 요소를 하나만 받아오도록 설정했으므로 첫번째 요소만 반환하면 됨)
      database.teams.filter(team => team.id === args.id)[0],
  },
};
```

**↓ 쿼리 요청**

```
query {
  team(id: 4) {
    id
    manager
    office
    extension_number
    mascot
    cleaning_duty
    project
  }
}
```

<img width="927" alt="image" src="https://user-images.githubusercontent.com/72931773/173052697-7bf7a93a-1b94-4c55-aee2-dcdb05ce2519.png">

### team에 supplies 연결해서 받아오기

```js
const typeDefs = gql`
  type Team {
    // ...
    supplies: [Supply]
  }
`;

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
    // ...
  },
};
```

**↓ 쿼리 요청**

```
query {
  teams {
    id
    manager
    office
    extension_number
    mascot
    cleaning_duty
    project
    supplies {
      id
      team
    }
  }
}
```

<details>
<summary>요청 반환값</summary>
<div markdown="1">

```json
{
  "data": {
    "teams": [
      {
        "id": 1,
        "manager": "Mandy Warren",
        "office": "101A",
        "extension_number": "#5709",
        "mascot": "Panda",
        "cleaning_duty": "Monday",
        "project": "Hyperion",
        "supplies": [
          {
            "id": "ergonomic mouse",
            "team": 1
          },
          {
            "id": "mug",
            "team": 1
          }
        ]
      },
      {
        "id": 2,
        "manager": "Stewart Grant",
        "office": "101B",
        "extension_number": "#4012",
        "mascot": "Tadpole",
        "cleaning_duty": "Tuesday",
        "project": "Zen",
        "supplies": [
          {
            "id": "webcam",
            "team": 2
          },
          {
            "id": "hoodie",
            "team": 2
          }
        ]
      },
      // ...

```

</div>
</details>

## Mutation

어떤 정보를 가져올 때는 Query를, 데이터의 추가/수정/삭제에는 Mutation을 사용하도록 약속되어있다.

### 데이터 삭제하기

**1. Mutation - 삭제 루트 타입**

String 인자 id를 받는 **deleteEquipment**: 삭제된 Equipment를 반환

```js
type Mutation {
    deleteEquipment(id: String): Equipment
}
```

**2. 삭제 resolver**

- 삭제 후 결과값으로 받아올 데이터를 deleted 변수에 저장
- 데이터에서 해당 데이터 삭제 후 deleted 반환
- 실제 프로젝트에서는 SQL의 DELETE 문 등으로 구현

```javascript
const resolvers = {
  // Query: { ... },
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
  },
};
```

**3. 삭제 요청**

```js
mutation {
  deleteEquipment(id: "notebook") {
    id
    used_by
    count
    new_or_used
  }
}
```

### 데이터 추가하기

**1. Mutation - 추가 루트 타입**

추가할 Equipment의 요소 값들을 인자로 받고 추가된 Equipment를 반환

```javascript
type Mutation {
    insertEquipment(
        id: String,
        used_by: String,
        count: Int,
        new_or_used: String
    ): Equipment
    ...
}
```

**2. 추가 resolver**

```javascript
const resolvers = {
  // Query: { ... },
  Mutation: {
    // deleteEquipment: ...,
    insertEquipment: (parent, args, context, info) => {
      database.equipments.push(args);
      return args;
    },
  },
};
```

**3. 추가 요청**

```
mutation {
  insertEquipment (
    id: "laptop",
    used_by: "developer",
    count: 17,
    new_or_used: "new"
  ) {
    id
    used_by
    count
    new_or_used
  }
}
```

**↓ 반환**

```
{
  "data": {
    "insertEquipment": {
      "id": "laptop",
      "used_by": "developer",
      "count": 17,
      "new_or_used": "new"
    }
  }
}
```

### 데이터 수정하기

**1. Mutation - 수정 루트 타입**

수정할 Equipment의 요소 값들을 인자로 받고 추가된 Equipment를 반환

```js
type Mutation {
    editEquipment(
        id: String,
        used_by: String,
        count: Int,
        new_or_used: String
    ): Equipment
    ...
}
```

**2. 수정 resolver**

```js
const resolvers = {
  Mutation: {
    // ...
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
    // ...
  },
};
```

**3. 수정 요청**

```js
mutation {
  editEquipment (
    id: "pen tablet",
    new_or_used: "new",
    count: 30,
    used_by: "designer"
  ) {
    id
    new_or_used
    count
    used_by
  }
}
```

**↓ 반환 데이터**

```json
{
  "data": {
    "editEquipment": {
      "id": "pen tablet",
      "new_or_used": "new",
      "count": 30,
      "used_by": "designer"
    }
  }
}
```
