import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isOnboarded: user.isOnboarded || false,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // 🔥 FIX
    }),

    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // 🔥 FIX
      authorization: {
        params: { scope: "openid profile email" },
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const client = await clientPromise;
      const db = client.db();

      if (user?.email) {
        let dbUser = await db.collection("users").findOne({
          email: user.email,
        });

        if (!dbUser) {
          const result = await db.collection("users").insertOne({
            email: user.email,
            name: user.name || "",
            isOnboarded: false,
            createdAt: new Date(),
          });

          dbUser = {
            _id: result.insertedId,
            email: user.email,
            isOnboarded: false,
          };
        }

        token.id = dbUser._id.toString();
        token.isOnboarded = dbUser.isOnboarded;
      }

      if (trigger === "update" && session?.isOnboarded !== undefined) {
        token.isOnboarded = session.isOnboarded;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isOnboarded = token.isOnboarded;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl + "/onboarding"; // 🔥 ALWAYS go here after OAuth
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };