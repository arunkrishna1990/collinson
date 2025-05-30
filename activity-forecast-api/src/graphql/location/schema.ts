import { gql } from 'graphql-tag'

export const locationTypeDefs = gql`
  type Location {
    name: String!
    country: String!
    latitude: Float!
    longitude: Float!
  }
  
  extend type Query {
    searchLocation(name: String!): [Location!]!
  }
`