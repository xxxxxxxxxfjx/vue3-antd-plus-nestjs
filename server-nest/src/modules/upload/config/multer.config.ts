import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FILE_UPLOAD_CONFIG } from '../../../common/constants/file.constants';
import { FileUtil } from '../../../common/utils/file.util';

const uploadDir = join(process.cwd(), FILE_UPLOAD_CONFIG.UPLOAD_DIR);

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const filename = FileUtil.generateFilename(file.originalname);
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: FILE_UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
};
