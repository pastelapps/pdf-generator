import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loadCourseData } from '../services/course-loader.js';
import { buildViewModel } from '../services/view-model-builder.js';
import { renderHtml } from '../services/html-renderer.js';
import { renderPdf } from '../services/pdf-renderer.js';
import { uploadPdf } from '../services/storage.js';
import { updateFolderPdfUrl } from '../services/course-updater.js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const sectionOverridesSchema = z.object({
  about: z.object({
    margin_top: z.string().optional(),
    margin_bottom: z.string().optional(),
    margin_lateral: z.string().optional(),
  }).optional(),
  audience: z.object({
    margin_top: z.string().optional(),
    card_margin_bottom: z.string().optional(),
  }).optional(),
  program: z.object({
    day_margin_top: z.string().optional(),
  }).optional(),
  speakers: z.object({
    margin_top: z.string().optional(),
  }).optional(),
}).optional();

const bodySchema = z.object({
  edition_id: z.string().uuid(),
  template: z.string().default('plenum-curso-v1'),
  section_overrides: sectionOverridesSchema,
});

export async function generatePdfRoute(app: FastifyInstance) {
  app.post('/api/v1/generate-pdf', async (request, reply) => {
    const parseResult = bodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'INVALID_BODY',
        message: 'Body inválido',
        details: parseResult.error.issues,
      });
    }

    const { edition_id, template, section_overrides } = parseResult.data;

    if (template !== 'plenum-curso-v1') {
      return reply.status(400).send({
        error: 'UNSUPPORTED_TEMPLATE',
        message: `Template "${template}" não suportado. Use "plenum-curso-v1".`,
      });
    }

    const debug = (request.query as Record<string, string>).debug === 'true';

    request.log.info({ editionId: edition_id }, 'Iniciando geração de PDF');

    // 1. Carregar dados
    request.log.info('Carregando dados do Supabase...');
    const courseData = await loadCourseData(edition_id);

    // 2. Montar ViewModel
    request.log.info('Montando ViewModel...');
    const viewModel = buildViewModel(courseData, edition_id, section_overrides);

    // 3. Renderizar HTML
    request.log.info('Renderizando HTML...');
    const html = renderHtml(viewModel);

    // Debug mode: retorna HTML direto
    if (debug) {
      return reply.type('text/html').send(html);
    }

    // 4. Gerar PDF
    request.log.info('Gerando PDF com Playwright...');
    const pdfBuffer = await renderPdf(html);

    // 5. Salvar localmente
    const timestamp = Date.now();
    const filename = `${courseData.course.slug}-${edition_id}-${timestamp}.pdf`;
    const localPath = path.resolve(process.cwd(), 'output', filename);
    writeFileSync(localPath, pdfBuffer);
    request.log.info({ localPath }, 'PDF salvo localmente');

    // 6. Upload pro Supabase Storage
    request.log.info('Fazendo upload pro Supabase Storage...');
    const pdfUrl = await uploadPdf(pdfBuffer, filename);

    // 7. Atualizar banco
    request.log.info('Atualizando folder_pdf_url no banco...');
    await updateFolderPdfUrl(edition_id, pdfUrl);

    request.log.info({ pdfUrl }, 'Pipeline completo');

    return reply.status(200).send({
      success: true,
      pdf_url: pdfUrl,
      generated_at: new Date().toISOString(),
      edition_id,
    });
  });
}
