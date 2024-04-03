import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
export const hashData = async (data: string): Promise<string> => {
  const hashData = bcrypt.hashSync(data, 8);
  return hashData;
};

export const generateHashKey = (): string => {
    const hash = crypto.createHash('sha256');
    const currentTimeUnix = Math.floor(new Date().getTime() / 1000);
    hash.update(currentTimeUnix.toString());
    return hash.digest('hex');
  }

