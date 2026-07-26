import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServer } from '@apollo/server';
import dotenv from 'dotenv';
import express from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from "cookie-parser";
import User from "../src/Schema/UserSchema/UserSchema.js";
import uploadOnCloudinary from "../src/utils/cloudnary.js";
import { connectDB } from "../src/config/dbconnect.js";
import { resolvers } from "../src/graph/resolvers/Resolver.js";
import { schema } from "../src/graph/schema/schema.js";
import { upload } from "../src/middleware/multer.js";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();

// ---- DB connection: reuse across invocations instead of reconnecting on
// every request (serverless functions are re-invoked, not long-running). ----
let dbConnected = false;
async function ensureDB() {
  if (dbConnected) return;
  await connectDB();
  dbConnected = true;
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. https://your-frontend.vercel.app
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    await ensureDB();

    if (!req.file) {
      return res.status(400).json({ error: "Koi file nahi mili" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Sirf image files allowed hain" });
    }

    const imageUrl = await uploadOnCloudinary(req.file.buffer);

    if (!imageUrl) {
      return res.status(500).json({ error: "Cloudinary upload fail ho gaya" });
    }

    return res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Upload mein error aaya" });
  }
});

// ---- Apollo Server: must be fully started BEFORE expressMiddleware() is
// called — expressMiddleware asserts started status at creation time, not
// per-request. Top-level await works here because package.json has
// "type": "module". ----
const server = new ApolloServer({
  typeDefs: schema,
  resolvers: resolvers,
  // No ApolloServerPluginDrainHttpServer here — there's no long-lived
  // httpServer to drain in a serverless function.
});

await server.start();

app.use(
  "/graphql",
  async (req, res, next) => {
    await ensureDB();
    next();
  },
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies?.uid;

      if (!token) {
        return { req, res, user: null };
      }

      try {
        interface DecodedToken extends JwtPayload {
          userId: string;
        }

        const userVerification = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as DecodedToken;

        const freshUser = await User.findOne({ _id: userVerification?.userId } as any);

        if (!freshUser) {
          return { req, res, user: null };
        }

        return {
          req,
          res,
          user: {
            userId: freshUser._id,
            email: freshUser.email,
            Role: freshUser.Role,
            Isbaned: freshUser.Isbaned,
            Status: freshUser.Status,
          },
        };
      } catch (error) {
        return {
          req,
          res,
          user: null,
        };
      }
    },
  })
);

// Local dev: run a real listening server. On Vercel, this file is imported
// as a handler instead — `vercel dev`/production never calls `.listen()`.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
}

export default app;