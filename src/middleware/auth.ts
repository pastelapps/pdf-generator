import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { findTenantByToken, type Tenant } from '../clients/tenant-db.js';

declare module 'fastify' {
  interface FastifyRequest {
    tenant: Tenant;
  }
}

const PUBLIC_ROUTES = ['/health'];

export const authMiddleware = fp(async function authMiddleware(app: FastifyInstance): Promise<void> {
  app.decorateRequest('tenant', null);
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (PUBLIC_ROUTES.includes(request.url.split('?')[0]!)) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'UNAUTHORIZED',
        message: 'Token de autenticação ausente ou mal formatado',
      });
    }

    const token = authHeader.slice(7);
    const tenant = findTenantByToken(token);

    if (!tenant) {
      return reply.status(401).send({
        error: 'UNAUTHORIZED',
        message: 'Token inválido',
      });
    }

    if (!tenant.active) {
      return reply.status(403).send({
        error: 'FORBIDDEN',
        message: 'Tenant inativo',
      });
    }

    request.tenant = tenant;
  });
});
