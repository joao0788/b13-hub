import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pino from "pino";
import router from "./routes";

const logger = pino();

const app: Express = express();

app.use((req: Request, res: Response, next) => {
  (req as any).id = crypto.randomUUID?.() ?? Math.random().toString(36);
  next();
});

app.use(
  pino({
    transport: {
      target: "pino-pretty",
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
