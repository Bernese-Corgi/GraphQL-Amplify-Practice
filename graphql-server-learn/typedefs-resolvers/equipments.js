const { gql } = require('apollo-server');
const dbWorks = require('../dbWorks');

const typeDefs = gql`
  type Equipment {
    id: String
    used_by: String
    count: Int
    new_or_used: String
  }
  type EquipmentAdv {
    id: ID!
    used_by: String!
    count: Int!
    use_rate: Float
    is_new: Boolean!
  }
`;

const resolvers = {
  Query: {
    equipments: (parent, args) => dbWorks.getEquipments(args),
    equipmentAdvs: (parent, args) =>
      dbWorks.getEquipments(args).map(equipment => {
        if (equipment.used_by === 'developer') {
          equipment.use_rate = Math.random().toFixed(2);
        }
        equipment.is_new = equipment.new_or_used === 'new';
        return equipment;
      }),
  },
  Mutation: {
    deleteEquipment: (parent, args) => dbWorks.deleteItem('equipments', args),
  },
};

module.exports = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
