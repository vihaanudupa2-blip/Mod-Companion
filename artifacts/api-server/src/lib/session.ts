import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    accessToken: string;
    guilds: DiscordGuild[];
  }
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});
