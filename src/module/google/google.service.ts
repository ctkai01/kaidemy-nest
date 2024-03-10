import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GoogleInfo } from 'src/interface';
@Injectable()
export class GoogleAuthenticationService {
  constructor() {}

  async authenticate(token: string): Promise<GoogleInfo> {
    const tokenInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
    );

    const dataInfo: GoogleInfo = tokenInfo.data;

    return dataInfo;
  }
}
