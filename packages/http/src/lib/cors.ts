import koaCors from '@koa/cors';
import {Context} from 'koa';

export function corsMiddleware(additionalHeaders?: string[]) {
  const allowHeaders = ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-User', 'X-WALLET-AUTH'];

  if(additionalHeaders !== undefined) {
    allowHeaders.push(...additionalHeaders)
  }

  return koaCors({
    origin: getAllowedOrigin,
    allowHeaders: allowHeaders,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: false
  });
}

export function getAllowedOrigin(ctx: Context): string {
  const allowedOrigins: string [] = [];
  const origin = ctx.request.header.origin;

  allowedOrigins.push(origin!);

  if (origin && (allowedOrigins.includes(origin))) {
    return origin;
  } else {
    return '*';
  }
}