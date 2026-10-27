import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Auto-sanitize NEXTAUTH_URL and VERCEL_URL if they contain typos (e.g. trailing parentheses or punctuation)
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/[\)\.\,\'\"\s]+$/, "");
}
if (process.env.VERCEL_URL) {
  process.env.VERCEL_URL = process.env.VERCEL_URL.replace(/[\)\.\,\'\"\s]+$/, "");
}

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user?.password) {
            throw new Error("Invalid credentials");
          }

          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials");
          }

          return user;
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const cleanBase = (baseUrl || "").replace(/[\)\.\,\'\"\s]+$/, "");
      if (url.startsWith("/")) {
        return `${cleanBase}${url}`;
      }
      try {
        const cleanUrl = url.replace(/[\)\.\,\'\"\s]+$/, "");
        const parsedUrl = new URL(cleanUrl);
        const parsedBase = new URL(cleanBase);
        if (parsedUrl.origin === parsedBase.origin) {
          return cleanUrl;
        }
      } catch {}
      return cleanBase || "/";
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore - role exists on our user model
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
