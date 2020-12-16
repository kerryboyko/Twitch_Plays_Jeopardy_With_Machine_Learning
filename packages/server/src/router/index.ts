import { Application } from "express";
import middleware from "./middleware";
import postUserId from "./post/userid";

const router = (app: Application, apiToken: string): void => {
  middleware(app);
  postUserId(app, apiToken);
  app.get("/hello", (_req, res) => {
    res.send("Hello World");
  });
};

export default router;
