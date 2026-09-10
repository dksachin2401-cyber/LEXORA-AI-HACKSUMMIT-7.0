import fs from 'fs';
import path from 'path';

export interface StorageCheck {
  path: string;
  sizeMb: number;
  ok: boolean;
  warning: boolean;
}

function getFolderSizeMb(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let totalBytes = 0;

  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        totalBytes += getFolderSizeMb(fullPath) * 1024 * 1024;
      } else if (file.isFile()) {
        totalBytes += fs.statSync(fullPath).size;
      }
    }
  } catch (e) {
    // Ignore permissions or unreadable directory errors
  }

  return parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
}

export function checkStorageHealth(): {
  db: StorageCheck;
  uploads: StorageCheck;
  backups: StorageCheck;
} {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const uploadsPath = path.join(process.cwd(), 'uploads');
  const backupsPath = path.join(process.cwd(), 'backups');

  const warningUploadsMb = parseInt(process.env.DISK_WARNING_MB_UPLOADS || '500', 10);
  const warningBackupsMb = parseInt(process.env.DISK_WARNING_MB_BACKUPS || '1000', 10);

  const dbSizeMb = fs.existsSync(dbPath) ? parseFloat((fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2)) : 0;
  const uploadsSizeMb = getFolderSizeMb(uploadsPath);
  const backupsSizeMb = getFolderSizeMb(backupsPath);

  return {
    db: {
      path: dbPath,
      sizeMb: dbSizeMb,
      ok: true,
      warning: dbSizeMb > 100,
    },
    uploads: {
      path: uploadsPath,
      sizeMb: uploadsSizeMb,
      ok: uploadsSizeMb < warningUploadsMb * 2,
      warning: uploadsSizeMb > warningUploadsMb,
    },
    backups: {
      path: backupsPath,
      sizeMb: backupsSizeMb,
      ok: backupsSizeMb < warningBackupsMb * 2,
      warning: backupsSizeMb > warningBackupsMb,
    },
  };
}
