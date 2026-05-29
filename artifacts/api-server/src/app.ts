import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pino from "pino";
import router from "./routes";

const logger = pino();

const app: Express = express();

// middleware simples de log (substitui pino-http)
app.use((req: Request, res: Response, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: Date.now() - start,
    });
  });

  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
