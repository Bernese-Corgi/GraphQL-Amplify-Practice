# GraphQL과 Apollo 라이브러리를 활용해 서비스를 구현하는 실습

해당 저장소는 [얄팍한 GraphQL & Apollo 강좌](https://www.yalco.kr/lectures/graphql-apollo/)를 통해 실습한 예제입니다.

## GraphQL Playground

- 작성한 GraphQL type, resolve 명세를 확인
- 데이터 요청 및 전송 테스트 가능

## Query 구현하기

### Type 지정하기

**typeDef**

- GrqphQL 명세에서 사용될 데이터, 요청의 타입 지정
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

또는

```
query {
  supplies {
    id
    team
  }
}
```
