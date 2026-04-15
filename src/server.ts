import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { logger } from './logger.js';
import { healthRoute } from './routes/health.js';
import { generatePdfRoute } from './routes/generate-pdf.js';
import { authMiddleware } from './middleware/auth.js';
import { initTenantDb } from './clients/tenant-db.js';
import { AppError } from './utils/errors.js';

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
});

// Error handler global
app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    request.log.error({ code: error.code, details: error.details }, error.message);
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      details: error.details,
    });
  }

  // Zod validation errors
  if (error.name === 'ZodError') {
    request.log.error({ details: error }, 'Erro de validação');
    return reply.status(422).send({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: error,
    });
  }

  request.log.error(error, 'Erro interno');
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor',
  });
});

// Inicializar SQLite de tenants
initTenantDb();

await app.register(cors, { origin: true });
await app.register(authMiddleware);

await app.register(healthRoute);
await app.register(generatePdfRoute);

const shutdown = async (signal: string) => {
  logger.info(`Recebido ${signal}, encerrando...`);
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
  logger.info(`Servidor rodando na porta ${config.PORT} [${config.NODE_ENV}]`);
} catch (err) {
  logger.error(err, 'Erro ao iniciar servidor');
  process.exit(1);
}
