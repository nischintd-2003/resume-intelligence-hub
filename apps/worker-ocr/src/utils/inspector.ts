import fs from 'fs';

export type SupportedFileType = 'pdf' | 'docx' | 'image' | 'unsupported';

export const detectFileType = async (filePath: string): Promise<SupportedFileType> => {
  const { fileTypeFromStream } = await import('file-type');

  const stream = fs.createReadStream(filePath, { end: 4096 });
  const type = await fileTypeFromStream(stream);

  if (!type) return 'unsupported';

  if (type.mime === 'application/pdf') return 'pdf';
  if (type.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return 'docx';
  if (type.mime.startsWith('image/')) return 'image';

  return 'unsupported';
};
