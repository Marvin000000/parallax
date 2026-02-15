import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// ... existing imports

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    // Guest Provider: Treats a UUID as a "password" to log in
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        uuid: { label: "UUID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.uuid) return null;

        // Try to find existing guest user
        let user = await prisma.user.findFirst({
          where: { email: `${credentials.uuid}@guest.parallax.local` },
        });

        // If not found, create new Guest User
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: `Guest-${credentials.uuid.substring(0, 5)}`,
              email: `${credentials.uuid}@guest.parallax.local`,
              image: `https://api.dicebear.com/7.x/identicon/svg?seed=${credentials.uuid}`,
              clusterLabel: "Unassigned",
              clusterId: 0,
            },
          });
        }
        return user;
      },
    }),
  ],
  callbacks: {
    // ... existing callbacks
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
        session.user.clusterId = user.clusterId || 0;
        session.user.clusterLabel = user.clusterLabel || "Observer";
      }
      return session;
    },
  },
};
