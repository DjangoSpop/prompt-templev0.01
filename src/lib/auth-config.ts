import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiClient } from './api-client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          const tokenPair = await apiClient.login({
            username: credentials.username,
            password: credentials.password,
          });

          const user = await apiClient.getProfile();

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`.trim() || user.username,
            image: user.avatar_url,
            accessToken: tokenPair.access,
            refreshToken: tokenPair.refresh,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === 'credentials') {
          // For credentials login, we already have the tokens
          return {
            ...token,
            accessToken: (user as any).accessToken,
            refreshToken: (user as any).refreshToken,
            provider: 'credentials',
          };
        } else {
          // For social logins, we need to exchange the social token for our JWT
          try {
            const socialAuthData = {
              provider: account.provider,
              access_token: account.access_token,
              id_token: account.id_token,
              user_info: {
                email: user.email,
                name: user.name,
                image: user.image,
                provider_id: account.providerAccountId,
              },
            };

            // Call your backend to handle social auth
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/social/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(socialAuthData),
            });

            if (response.ok) {
              const { access, refresh } = await response.json();
              return {
                ...token,
                accessToken: access,
                refreshToken: refresh,
                provider: account.provider,
              };
            }
          } catch (error) {
            console.error('Social auth error:', error);
          }
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.exp as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.provider = token.provider as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      // Fall back to old refresh token, but note that
      // many providers may only allow using a refresh token once.
      refreshToken: refreshedTokens.refresh ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export default NextAuth(authOptions);