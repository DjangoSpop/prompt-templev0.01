import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    exp?: number;
  }
}