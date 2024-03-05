// upload.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { UploadResource } from 'src/constants';
const HOSTNAME = 'sg.storage.bunnycdn.com';
const STORAGE_ZONE_NAME = 'kaidemy';

interface GetVideoBunny {
  length: number;
  storageSize: number;
  status: number;
}

interface ResponseVideoBunny {
  url: string;
  videoID: string;
  duration: number;
  storageSize: number;
}

@Injectable()
export class UploadService {
  async uploadResource(
    file: Express.Multer.File,
    type: UploadResource,
  ): Promise<string> {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;

      let FILENAME_TO_UPLOAD = `avatar/${fileName}`;

      if (type === UploadResource.Resource) {
        FILENAME_TO_UPLOAD = `resource/${fileName}`;
      }
      console.log('file.path: ', file.path);

      const fileStream = fs.createReadStream(file.path);

      const url = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${FILENAME_TO_UPLOAD}`;

      await axios.put(url, fileStream, {
        headers: {
          AccessKey: 'dbdd63e4-0e75-4e3f-a20c53bf4675-bf59-427c',
        },
      });
      // Delete storage
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Failed to delete file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
      return `https://kaidemy.b-cdn.net/${FILENAME_TO_UPLOAD}`;
    } catch (err) {
      console.error('Error:', err);
    }
  }

  async deleteResource(fileURL: string): Promise<void> {
    try {
      let urlPath = fileURL.split('/').slice(-2).join('/');
      urlPath = `https://sg.storage.bunnycdn.com/kaidemy/${urlPath}`;

      await axios.delete(urlPath, {
        headers: {
          AccessKey: 'dbdd63e4-0e75-4e3f-a20c53bf4675-bf59-427c',
        },
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  async deleteVideo(videoID: string): Promise<void> {
    const deleteURL = `https://video.bunnycdn.com/library/155247/videos/${videoID}`;
    const deleteHeaders = {
      accept: 'application/json',
      'content-type': 'application/json',
      AccessKey: 'c6812b7c-3661-4edf-8cdaf55d81b1-5921-4f35',
    };

    try {
      const response = await axios.delete(deleteURL, {
        headers: deleteHeaders,
      });

      console.log('Video deleted successfully:', response.data);
    } catch (error) {
      console.error('Failed to delete video:', error);
      throw error;
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    title: string,
  ): Promise<ResponseVideoBunny> {
    try {
      // Step 1: Upload the video metadata
      const uploadURL = 'https://video.bunnycdn.com/library/155247/videos';
      const uploadHeaders = {
        accept: 'application/json',
        'content-type': 'application/json',
        AccessKey: 'c6812b7c-3661-4edf-8cdaf55d81b1-5921-4f35',
      };

      const uploadBody = {
        title,
      };

      const uploadResponse = await axios.post(uploadURL, uploadBody, {
        headers: uploadHeaders,
      });

      const videoGUID = uploadResponse.data.guid;

      // Step 2: Upload the video file
      const videoURL = `https://video.bunnycdn.com/library/155247/videos/${videoGUID}`;
      const videoHeaders = {
        accept: 'application/json',
        'content-type': 'application/octet-stream',
        AccessKey: 'c6812b7c-3661-4edf-8cdaf55d81b1-5921-4f35',
      };

      const videoStream = fs.createReadStream(file.path);

      await axios.put(videoURL, videoStream, {
        headers: videoHeaders,
      });

      // Delete storage
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Failed to delete file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });

      // Step 3: Get info video
      for (;;) {
        // Code that runs infinitely
        const getVideoHeaders = {
          accept: 'application/json',
          AccessKey: 'c6812b7c-3661-4edf-8cdaf55d81b1-5921-4f35',
        };

        const getVideoURL = `https://video.bunnycdn.com/library/155247/videos/${videoGUID}`;

        const getVideoResponse = await axios.get<GetVideoBunny>(getVideoURL, {
          headers: getVideoHeaders,
        });
        const result = getVideoResponse.data;

        if (result.length == 0) {
          continue;
        }
        return {
          duration: result.length,
          storageSize: result.storageSize,
          url: videoGUID,
          videoID: videoGUID,
        };
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }
}
