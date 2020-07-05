const { gql } = require("apollo-server");

// Schema
const typeDefs = gql`
  type Curso {
    titulo: String
  }
  type Tecnologia {
    tecnologia: String
  }
  input CursoInput {
    tecnologia: String
  }
  type Query {
    obtenerCursos(input: CursoInput!): [Curso]
    obtenerTecnologia: [Tecnologia]
  }
`;

module.exports = typeDefs;
