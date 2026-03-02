export type SupportedFileType = 'pdf' | 'docx' | 'image' | 'unsupported';

export const detectFileType = async (buffer: Buffer): Promise<SupportedFileType> => {
  const { fileTypeFromBuffer } = await import('file-type');

  const type = await fileTypeFromBuffer(buffer);

  if (!type) return 'unsupported';

  if (type.mime === 'application/pdf') return 'pdf';
  if (type.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return 'docx';
  if (type.mime.startsWith('image/')) return 'image';

  return 'unsupported';
};
