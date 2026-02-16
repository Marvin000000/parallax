import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        uuid: { label: "UUID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.uuid) return null;

        const email = `${credentials.uuid}@guest.parallax.local`;
        let user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: `Guest-${credentials.uuid.substring(0, 5)}`,
              email,
              image: `https://api.dicebear.com/7.x/identicon/svg?seed=${credentials.uuid}`,
              clusterLabel: "Unassigned",
              topicClusters: {}, // Ensure valid JSON
            },
          });
        }
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      // First login
      if (user) {
        token.id = user.id;
        token.clusterId = user.clusterId || 0;
        token.clusterLabel = user.clusterLabel || "Observer";
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.clusterId = token.clusterId;
        session.user.clusterLabel = token.clusterLabel;
      }
      return session;
    },
  },
};
