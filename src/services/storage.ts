import { supabase } from '../clients/supabase.js';
import { config } from '../config.js';
import { StorageError } from '../utils/errors.js';
import { logger } from '../logger.js';

export async function uploadPdf(buffer: Buffer, filename: string): Promise<string> {
  const filePath = `${config.SUPABASE_STORAGE_FOLDER}/${filename}`;

  logger.info({ bucket: config.SUPABASE_STORAGE_BUCKET, path: filePath }, 'Fazendo upload do PDF');

  const { error } = await supabase.storage
    .from(config.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new StorageError(`Falha no upload do PDF: ${error.message}`, error);
  }

  const { data: urlData } = supabase.storage
    .from(config.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  logger.info({ url: urlData.publicUrl }, 'PDF uploaded com sucesso');
  return urlData.publicUrl;
}
