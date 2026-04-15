import { supabase } from '../clients/supabase.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';
import { logger } from '../logger.js';

export async function updateFolderPdfUrl(editionId: string, pdfUrl: string): Promise<void> {
  const { error, count } = await supabase
    .from('course_dates')
    .update({ folder_pdf_url: pdfUrl })
    .eq('id', editionId);

  if (error) {
    throw new DatabaseError(`Erro ao atualizar folder_pdf_url: ${error.message}`, error);
  }

  logger.info({ editionId, pdfUrl }, 'folder_pdf_url atualizado');
}
