import express from "express";
import { createServer as createViteServer } from "vite";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import cookieSession from "cookie-session";
import axios from "axios";

dotenv.config();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1478574512240070698";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "xSg72vy9mElJgniopYFWTwtzQkfsys_k";

// Fallback credentials provided by the user in the prompt
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "https://enabling-marlin-64719.upstash.io";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "AvzPAAIgcDI6kBWBhJ2rcswGaLrmo_NTJL8i1DPsmdQPKI2NAM8T1Q";

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "default-secret"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: "none",
    })
  );

  // Auth Routes
  app.get("/api/auth/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL || `http://localhost:${PORT}`}/auth/callback`;
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify email identify.premium connections guilds.join guilds.members.read guilds",
    });
    const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    const redirectUri = `${process.env.APP_URL || `http://localhost:${PORT}`}/auth/callback`;
    
    try {
      // Exchange code for token
      const tokenResponse = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: DISCORD_CLIENT_ID!,
          client_secret: DISCORD_CLIENT_SECRET!,
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Get connections
      const connectionsResponse = await axios.get("https://discord.com/api/users/@me/connections", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Get guilds
      const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const discordUser = userResponse.data;
      
      if (req.session) {
        req.session.user = {
          id: discordUser.id,
          email: discordUser.email,
          name: discordUser.global_name || discordUser.username,
          picture: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || "0") % 5}.png`,
          connections: connectionsResponse.data,
          guilds: guildsResponse.data,
          accessToken: access_token,
        };
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Auth error:", error?.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/auth/me", (req, res) => {
    res.json(req.session?.user || null);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // Protected API Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // API Routes
  app.get("/api/keys", requireAuth, async (req, res) => {
    try {
      const keys = await redis.hgetall("script_keys");
      if (!keys) return res.json([]);
      const keysList = Object.entries(keys).map(([id, data]) => ({
        id,
        ...(data as object),
      }));
      res.json(keysList);
    } catch (error) {
      console.error("Error fetching keys:", error);
      res.status(500).json({ error: "Failed to fetch keys" });
    }
  });

  app.post("/api/keys", requireAuth, async (req, res) => {
    try {
      const { userName, game, scriptName, expiresAt } = req.body;
      const id = uuidv4();
      const key = `SK-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const newKey = {
        key,
        userName,
        game,
        scriptName,
        expiresAt,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      await redis.hset("script_keys", { [id]: newKey });
      res.json({ id, ...newKey });
    } catch (error) {
      console.error("Error creating key:", error);
      res.status(500).json({ error: "Failed to create key" });
    }
  });

  app.delete("/api/keys/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await redis.hdel("script_keys", id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ error: "Failed to delete key" });
    }
  });

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const keys = await redis.hgetall("script_keys");
      const keysList = keys ? Object.values(keys) : [];
      
      const stats = {
        totalKeys: keysList.length,
        activeKeys: keysList.filter((k: any) => k.status === "active").length,
        expiredKeys: keysList.filter((k: any) => new Date(k.expiresAt) < new Date()).length,
        uniqueUsers: new Set(keysList.map((k: any) => k.userName)).size,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
