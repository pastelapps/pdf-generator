import type { SupabaseClient } from '@supabase/supabase-js';
import { StorageError } from '../utils/errors.js';
import { logger } from '../logger.js';

export type StorageConfig = {
  bucket: string;
  folder: string;
};

export async function uploadPdf(
  supabase: SupabaseClient,
  storageConfig: StorageConfig,
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const filePath = `${storageConfig.folder}/${filename}`;

  logger.info({ bucket: storageConfig.bucket, path: filePath }, 'Fazendo upload do PDF');

  const { error } = await supabase.storage
    .from(storageConfig.bucket)
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new StorageError(`Falha no upload do PDF: ${error.message}`, error);
  }

  const { data: urlData } = supabase.storage
    .from(storageConfig.bucket)
    .getPublicUrl(filePath);

  logger.info({ url: urlData.publicUrl }, 'PDF uploaded com sucesso');
  return urlData.publicUrl;
}
