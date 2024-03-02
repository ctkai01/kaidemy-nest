import * as bcrypt from 'bcryptjs';

export const hashData = async (data: string): Promise<string> => {
  const hashData = bcrypt.hashSync(data, 8);
  return hashData;
};
