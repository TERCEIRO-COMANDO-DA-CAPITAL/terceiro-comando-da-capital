import express from "express";
import { createServer as createViteServer } from "vite";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import cookieSession from "cookie-session";
import axios from "axios";
import crypto from "crypto";

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

// Helper to get a daily rotating secret
function getDailySecret() {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const masterSecret = "tcc-painel-master-key-2024";
  // Simple hash-like string for the day
  return `${masterSecret}-${date}`;
}

// Helper to get all keys matching a pattern using SCAN (safer than KEYS)
async function getAllKeys(pattern: string) {
  let cursor = "0";
  let allKeys: string[] = [];
  try {
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = nextCursor;
      allKeys.push(...keys);
    } while (cursor !== "0");
  } catch (error) {
    console.error(`Error scanning keys for pattern ${pattern}:`, error);
    // Fallback or rethrow
    throw error;
  }
  return allKeys;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Session configuration with daily rotating key
  app.use((req, res, next) => {
    cookieSession({
      name: "session",
      keys: [getDailySecret()],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: "none",
    })(req, res, next);
  });

  // Auth Routes
  app.get("/api/auth/url", (req, res) => {
    const host = req.get('host');
    const protocol = req.protocol === 'http' && host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : `http://localhost:${PORT}`);
    const redirectUri = `${baseUrl}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify email guilds",
    });
    const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    const host = req.get('host');
    const protocol = req.protocol === 'http' && host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : `http://localhost:${PORT}`);
    const redirectUri = `${baseUrl}/auth/callback`;
    
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

      const discordUser = userResponse.data;
      
      // Store user in Redis with 7-day expiration (1 week)
      // If they don't login for 1 week, they lose access/data
      const userProfile = {
        id: discordUser.id,
        username: discordUser.username,
        lastLogin: new Date().toISOString(),
      };
      await redis.set(`user_profile:${discordUser.id}`, userProfile, { ex: 7 * 24 * 60 * 60 });

      if (req.session) {
        req.session.user = {
          id: discordUser.id,
          email: discordUser.email,
          name: discordUser.global_name || discordUser.username,
          picture: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || "0") % 5}.png`,
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

  // Protected API Middleware - DISABLED for direct access
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Automatically provide a system user if not present
    if (!req.session?.user) {
      req.session = req.session || {};
      req.session.user = {
        id: "system-user",
        name: "System Admin",
        picture: "https://cdn.discordapp.com/embed/avatars/0.png",
        email: "admin@system.local"
      };
    }
    next();
  };

  // API Routes
  app.get("/api/keys", requireAuth, async (req, res) => {
    try {
      // Use scan to find all script keys
      const keys = await getAllKeys("script_key:*");
      if (!keys || keys.length === 0) return res.json([]);
      
      const keysData = await Promise.all(
        keys.map(async (key) => {
          const data = await redis.get(key);
          if (data) {
            // Refresh key TTL on use (1 week of inactivity)
            await redis.set(key, data, { ex: 7 * 24 * 60 * 60 });
          }
          return { id: key.replace("script_key:", ""), ...(data as object) };
        })
      );
      
      res.json(keysData);
    } catch (error) {
      console.error("Error fetching keys:", error);
      res.status(500).json({ error: "Failed to fetch keys" });
    }
  });

  app.post("/api/keys", requireAuth, async (req, res) => {
    try {
      const { userName, game, scriptName, expiresAt } = req.body;
      const id = uuidv4();
      const userId = req.session?.user.id;
      
      // Daily unique key generation based on user ID and date (deterministic for the day)
      const date = new Date().toISOString().split("T")[0];
      const userHash = crypto.createHash('sha256').update(`${userId}-${date}-tcc-key-salt`).digest('hex').substring(0, 6).toUpperCase();
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const key = `SK-${date.replace(/-/g, "")}-${userHash}-${randomPart}`;
      
      const newKey = {
        key,
        userName,
        game,
        scriptName,
        expiresAt,
        createdAt: new Date().toISOString(),
        status: "active",
        ownerId: userId,
      };

      // Set key with 7-day expiration (1 week)
      // If not used/accessed, it will be deleted automatically
      await redis.set(`script_key:${id}`, newKey, { ex: 7 * 24 * 60 * 60 });
      
      res.json({ id, ...newKey });
    } catch (error) {
      console.error("Error creating key:", error);
      res.status(500).json({ error: "Failed to create key" });
    }
  });

  app.delete("/api/keys/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await redis.del(`script_key:${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ error: "Failed to delete key" });
    }
  });

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const keys = await getAllKeys("script_key:*");
      const keysData = await Promise.all(
        keys.map(async (key) => await redis.get(key))
      );
      const keysList = keysData.filter(k => k !== null) as any[];
      
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
