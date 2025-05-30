import { mergeTypeDefs } from '@graphql-tools/merge'
import { locationTypeDefs } from './location/schema'
import { activityForecastTypeDefs } from './activity-forecast/schema'

export const typeDefs = mergeTypeDefs([
  `#graphql
   type Query
  `,
  locationTypeDefs,
  activityForecastTypeDefs
])