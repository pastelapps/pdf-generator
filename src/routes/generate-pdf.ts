import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loadCourseData } from '../services/course-loader.js';
import { buildViewModel } from '../services/view-model-builder.js';
import { renderHtml } from '../services/html-renderer.js';
import { renderPdf } from '../services/pdf-renderer.js';
import { uploadPdf } from '../services/storage.js';
import { updateFolderPdfUrl } from '../services/course-updater.js';
import { getSupabaseClient } from '../clients/supabase-factory.js';
import { getAvailableTemplates } from '../../templates/registry.js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const sectionOverridesSchema = z.object({
  about: z.object({
    margin_top: z.string().optional(),
    margin_bottom: z.string().optional(),
    margin_lateral: z.string().optional(),
    icon_size: z.string().optional(),
    scale: z.string().optional(),
  }).optional(),
  audience: z.object({
    margin_top: z.string().optional(),
    card_margin_bottom: z.string().optional(),
    card_padding_vertical: z.string().optional(),
    card_font_size: z.string().optional(),
    icon_size: z.string().optional(),
  }).optional(),
  program: z.object({
    day_margin_top: z.string().optional(),
  }).optional(),
  speakers: z.object({
    margin_top: z.string().optional(),
    force_compact: z.string().optional(),
    scale: z.string().optional(),
  }).optional(),
}).optional();

const bodySchema = z.object({
  edition_id: z.string().uuid(),
  template: z.string().optional(),
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

    const { edition_id, section_overrides } = parseResult.data;
    const tenant = request.tenant;

    // Resolve template: body > tenant default
    const templateId = parseResult.data.template ?? tenant.default_template;

    const available = getAvailableTemplates();
    if (!available.includes(templateId)) {
      return reply.status(400).send({
        error: 'UNSUPPORTED_TEMPLATE',
        message: `Template "${templateId}" não suportado. Disponíveis: ${available.join(', ')}`,
      });
    }

    const debug = (request.query as Record<string, string>).debug === 'true';

    const supabase = getSupabaseClient(tenant);

    request.log.info({ editionId: edition_id, tenant: tenant.name, template: templateId }, 'Iniciando geração de PDF');

    // 1. Carregar dados
    request.log.info('Carregando dados do Supabase...');
    const courseData = await loadCourseData(supabase, edition_id);

    // 2. Montar ViewModel
    request.log.info('Montando ViewModel...');
    const viewModel = buildViewModel(courseData, edition_id, tenant.name, section_overrides);

    // 3. Renderizar HTML
    request.log.info('Renderizando HTML...');
    const html = renderHtml(viewModel, templateId);

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
    const pdfUrl = await uploadPdf(supabase, {
      bucket: tenant.storage_bucket,
      folder: tenant.storage_folder,
    }, pdfBuffer, filename);

    // 7. Atualizar banco
    request.log.info('Atualizando folder_pdf_url no banco...');
    await updateFolderPdfUrl(supabase, edition_id, pdfUrl);

    request.log.info({ pdfUrl }, 'Pipeline completo');

    return reply.status(200).send({
      success: true,
      pdf_url: pdfUrl,
      generated_at: new Date().toISOString(),
      edition_id,
    });
  });
}
