import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            session.accessToken = token.accessToken as string;
            return session;
        },
        async signIn({ user, account }) {
            if (!user.email) return false;

            // Create or update user in database
            try {
                await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name || "User",
                        avatar: user.image || undefined,
                    },
                    create: {
                        email: user.email,
                        name: user.name || "User",
                        avatar: user.image || undefined,
                    },
                });
            } catch (error) {
                console.error("Error upserting user:", error);
            }
            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
});

// Extend the session type
declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}
