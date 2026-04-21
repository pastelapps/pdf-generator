import { chromium } from 'playwright';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { RenderError } from '../utils/errors.js';
import { logger } from '../logger.js';

export async function renderPdf(html: string): Promise<Buffer> {
  const tmpFilename = `${randomUUID()}.html`;
  const tmpPath = path.resolve(process.cwd(), 'output/tmp', tmpFilename);

  writeFileSync(tmpPath, html, 'utf-8');
  logger.info({ tmpPath }, 'HTML temporário salvo');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      deviceScaleFactor: 4,
      screen: { width: 794, height: 1123 },
    });
    const page = await context.newPage();
    await page.setViewportSize({ width: 794, height: 1123 });

    await page.goto(`file://${tmpPath}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
    });

    await page.close();
    await context.close();

    logger.info('PDF gerado com sucesso');
    return Buffer.from(pdfBuffer);
  } catch (err) {
    throw new RenderError(
      `Falha ao gerar PDF: ${err instanceof Error ? err.message : String(err)}`,
      err
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    // Limpa temp em produção
    if (config.NODE_ENV !== 'development') {
      try { unlinkSync(tmpPath); } catch {}
    }
  }
}
