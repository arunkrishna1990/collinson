import { ApolloServer } from '@apollo/server';
import { koaMiddleware } from '@as-integrations/koa'
import Router from '@koa/router';
import { resolvers, typeDefs } from '../graphql';

export async function createGraphQLRouter(): Promise<Router> {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const router = new Router()
  router.post('/graphql', koaMiddleware(server))
  return router
}