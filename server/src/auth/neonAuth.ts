import "dotenv/config";
import { createAuthServer } from "@neondatabase/auth/server";

const authUrl = process.env.NEON_AUTH_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!authUrl) {
    throw new Error("NEON_AUTH_URL is not defined");
}

if (!cookieSecret || cookieSecret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters");
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
}

export async function validateSession(
    sessionToken: string,
    origin: string
): Promise<AuthenticatedUser | null> {

    if (!sessionToken) {
        return null;
    }

    // Construct the session cookie expected by Neon Auth.
    const cookieHeader =
        `__Secure-neon-auth.session_token=${sessionToken}`;

    const auth = createAuthServer({
        baseUrl: authUrl!,
        cookieSecret: cookieSecret!,

        context: () => ({
            getCookies: () => cookieHeader,

            setCookie: () => {
                // No HTTP response exists in a Socket.io handshake.
            },

            getHeader: (name) => {
                if (name.toLowerCase() === "origin") {
                    return origin || null;
                }

                return null;
            },

            getOrigin: () => origin || "",
            getFramework: () => "socket.io",
        }),
    });

    const result = await auth.getSession();

    if (result.error) {
        throw new Error(
            `Neon Auth session validation failed: ${result.error.message}`
        );
    }

    const user = result.data?.user;

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
    };
}