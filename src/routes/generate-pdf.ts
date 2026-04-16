import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loadCourseData } from '../services/course-loader.js';
import { buildViewModel } from '../services/view-model-builder.js';
import { loadCeapCourseData } from '../services/ceap-course-loader.js';
import { buildCeapViewModel, type CeapTemplateParams } from '../services/ceap-view-model-builder.js';
import { renderHtml } from '../services/html-renderer.js';
import { renderCeapHtml } from '../services/ceap-html-renderer.js';
import { renderPdf } from '../services/pdf-renderer.js';
import { uploadPdf } from '../services/storage.js';
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
    scale: z.string().optional(),
  }).optional(),
}).optional();

const ceapSectionOverridesSchema = z.object({
  apresentacao: z.object({
    margin_top: z.string().optional(),
    font_size: z.string().optional(),
    margin_bottom: z.string().optional(),
    card_padding: z.string().optional(),
    card_spacing: z.string().optional(),
    card_font_size: z.string().optional(),
  }).optional(),
  professor: z.object({
    margin_top: z.string().optional(),
    font_scale: z.string().optional(),
    card_margin_bottom: z.string().optional(),
    learn_font_size: z.string().optional(),
    learn_padding: z.string().optional(),
  }).optional(),
  programacao: z.object({
    date_margin_top: z.string().optional(),
    bullet_padding: z.string().optional(),
    font_size: z.string().optional(),
  }).optional(),
  capa: z.object({
    professor_font_size: z.string().optional(),
    professor_left_margin_left: z.string().optional(),
    professor_left_margin_right: z.string().optional(),
    professor_right_margin_left: z.string().optional(),
    professor_right_margin_right: z.string().optional(),
  }).optional(),
}).optional();

const templateParamsSchema = z.object({
  proposta_comercial: z.object({
    valor: z.string(),
  }).optional(),
  produto: z.enum(['licittoguru', 'plataforma', 'monicalopes']),
  cover_photo_url: z.string().optional(),
  professor_left_name: z.string().optional(),
  professor_right_name: z.string().optional(),
  professor_left_margins: z.object({
    left: z.string().optional(),
    right: z.string().optional(),
  }).optional(),
  professor_right_margins: z.object({
    left: z.string().optional(),
    right: z.string().optional(),
  }).optional(),
  professor_font_size: z.string().optional(),
  contato: z.object({
    telefone1: z.string().optional(),
    telefone2: z.string().optional(),
    email: z.string().optional(),
    site: z.string().optional(),
  }).optional(),
}).optional();

const bodySchema = z.object({
  edition_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  template: z.string().optional(),
  section_overrides: sectionOverridesSchema,
  ceap_section_overrides: ceapSectionOverridesSchema,
  template_params: templateParamsSchema,
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

    const { section_overrides, ceap_section_overrides, template_params } = parseResult.data;
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
    const isCeap = templateId.startsWith('ceap-');

    // === CEAP PIPELINE ===
    if (isCeap) {
      const courseId = parseResult.data.course_id;
      if (!courseId) {
        return reply.status(400).send({
          error: 'MISSING_COURSE_ID',
          message: 'Para templates CEAP, o campo "course_id" é obrigatório.',
        });
      }

      if (!template_params) {
        return reply.status(400).send({
          error: 'MISSING_TEMPLATE_PARAMS',
          message: 'Para templates CEAP, o campo "template_params" é obrigatório (pelo menos "produto" deve ser informado).',
        });
      }

      request.log.info({ courseId, tenant: tenant.name, template: templateId }, 'Iniciando geração de PDF CEAP');

      // 1. Carregar dados
      const courseData = await loadCeapCourseData(supabase, courseId);

      // 2. Montar ViewModel
      const viewModel = buildCeapViewModel(
        courseData,
        tenant.name,
        template_params as CeapTemplateParams,
        ceap_section_overrides,
      );

      // 3. Renderizar HTML
      const html = renderCeapHtml(viewModel, templateId);

      if (debug) {
        return reply.type('text/html').send(html);
      }

      // 4. Gerar PDF
      request.log.info('Gerando PDF com Playwright...');
      const pdfBuffer = await renderPdf(html);

      // 5. Upload pro Supabase Storage (sempre)
      const timestamp = Date.now();
      const filename = `${courseData.course.slug}-${courseId}-${timestamp}.pdf`;

      request.log.info('Fazendo upload pro Supabase Storage...');
      const pdfUrl = await uploadPdf(supabase, {
        bucket: tenant.storage_bucket,
        folder: tenant.storage_folder,
      }, pdfBuffer, filename);

      request.log.info({ pdfUrl }, 'Pipeline CEAP completo');

      return reply.status(200).send({
        success: true,
        pdf_url: pdfUrl,
        generated_at: new Date().toISOString(),
        course_id: courseId,
      });
    }

    // === PLENUM PIPELINE ===
    const editionId = parseResult.data.edition_id;
    if (!editionId) {
      return reply.status(400).send({
        error: 'MISSING_EDITION_ID',
        message: 'Para templates Plenum, o campo "edition_id" é obrigatório.',
      });
    }

    request.log.info({ editionId, tenant: tenant.name, template: templateId }, 'Iniciando geração de PDF');

    // 1. Carregar dados
    const courseData = await loadCourseData(supabase, editionId);

    // 2. Montar ViewModel
    const viewModel = buildViewModel(courseData, editionId, tenant.name, section_overrides);

    // 3. Renderizar HTML
    const html = renderHtml(viewModel, templateId);

    if (debug) {
      return reply.type('text/html').send(html);
    }

    // 4. Gerar PDF
    request.log.info('Gerando PDF com Playwright...');
    const pdfBuffer = await renderPdf(html);

    // 5. Upload pro Supabase Storage (sempre)
    const timestamp = Date.now();
    const filename = `${courseData.course.slug}-${editionId}-${timestamp}.pdf`;

    request.log.info('Fazendo upload pro Supabase Storage...');
    const pdfUrl = await uploadPdf(supabase, {
      bucket: tenant.storage_bucket,
      folder: tenant.storage_folder,
    }, pdfBuffer, filename);

    request.log.info({ pdfUrl }, 'Pipeline completo');

    return reply.status(200).send({
      success: true,
      pdf_url: pdfUrl,
      generated_at: new Date().toISOString(),
      edition_id: editionId,
    });
  });
}
