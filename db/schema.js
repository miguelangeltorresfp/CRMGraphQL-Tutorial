const { gql } = require("apollo-server");

// Schema
const typeDefs = gql`
  type Query {
    obtenerCurso: String
  }
`;

module.exports = typeDefs;
