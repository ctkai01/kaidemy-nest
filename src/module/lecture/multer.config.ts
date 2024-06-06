// multer.config.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerImageOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    console.log('typeUpdate: ', req.body.typeUpdate);
    console.log('assetType: ', req.body.assetType);
    console.log('assetType: ', req);
    const allowedMimes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          {
            message: `Unsupported file type ${extname(file.originalname)}`,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
        false,
      );
    }
  },
};

export const multerVideoOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      console.log('File: ', file);
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          {
            message: `Unsupported file type ${extname(file.originalname)}`,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
        false,
      );
    }
  },
};

export const multerResourceOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
};
