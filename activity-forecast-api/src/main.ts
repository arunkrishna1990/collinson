import { corsMiddleware } from '@collinson-test/http';
import { failure, Result, success } from '@collinson-test/types';
import { config } from 'dotenv';
import bodyParser from 'koa-bodyparser';

config();

import koa from 'koa';
import { createGraphQLRouter } from './routes/graphql';


(async () => {
  const isValidResult = validateEnvVariables();
  if (isValidResult.success === false) {
    throw new Error(isValidResult.error.message);
  }

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;

  const app = new koa();
  app.use(corsMiddleware());
  app.use(bodyParser());

  const graphqlRouter = await createGraphQLRouter()
  app.use(graphqlRouter.routes())

  app.use(bodyParser())

  app.listen(port, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
})();

function validateEnvVariables(): Result<Error, void> {
  if (!process.env.REDIS_PRIMARY_URI) {
    return failure(new Error('Missing REDIS_PRIMARY env variable'));
  }

  if (!process.env.REDIS_REPLICA_URI) {
    return failure(new Error('Missing REDIS_REPLICA env variable'));
  }

  if (!process.env.REDIS_PASSWORD) {
    return failure(new Error('Missing REDIS_PASSWORD env variable'));
  }

  return success();
}
