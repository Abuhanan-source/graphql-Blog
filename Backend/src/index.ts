import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServer } from '@apollo/server';
import { schema } from './graph/schema/schema.js';
import { resolvers } from './graph/resolvers/Resolver.js';
import dotenv from 'dotenv';
import { connectDB } from './config/dbconnect.js';
import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { upload } from "./middleware/multer.js";
import uploadOnCloudinary from "./utils/cloudnary.js";
import User from "./Schema/UserSchema/UserSchema.js";
dotenv.config();


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const port = Number(process.env.PORT) || 3000;

const app = express();
const httpServer = http.createServer(app);

connectDB();

const server = new ApolloServer({
  typeDefs:schema,
  resolvers:resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
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


app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies?.uid;

      if (!token) {
        return { req, res, user: null };
      }

      try {
        interface DecodedToken extends JwtPayload {
        userId: string;
        email:string;
        Isbaned:boolean;
        Status:boolean;
        Role:string;
        }

        const userVerification = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as DecodedToken

        const freshUser = await User.findOne({ _id: userVerification?.userId } as any);

          if (!freshUser) {
            return { req, res, user: null };
          }

         return {
          req,
          res,
          user: {
            userId: freshUser._id,
            email:freshUser.email,
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


await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);
