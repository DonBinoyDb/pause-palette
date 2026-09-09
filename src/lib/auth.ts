import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called with email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH] Missing email or password");
          throw new Error("Invalid credentials");
        }

        try {
          console.log("[AUTH] Looking up user in database...");
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user?.password) {
            console.error("[AUTH] User not found or has no password set");
            throw new Error("Invalid credentials");
          }

          console.log("[AUTH] User found, comparing passwords...");
          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isCorrectPassword) {
            console.error("[AUTH] Password comparison failed");
            throw new Error("Invalid credentials");
          }

          console.log("[AUTH] Password matched successfully. Returning user.");
          return user;
        } catch (error) {
          console.error("[AUTH] Exception during authorize:", error);
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
