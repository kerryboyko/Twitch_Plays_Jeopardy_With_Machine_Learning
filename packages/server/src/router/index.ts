import { Application } from "express";
import get from "lodash/get";
import middleware from "./middleware";
import postUserId from "./post/userid";

const router = (app: Application, apiToken: string): void => {
  middleware(app);
  postUserId(app, apiToken);
  app.get("/hello", (_req, res) => {
    res.send("Hello World");
  });
  app.get("/", (_req, res) => {
    res.send("App is running");
  });
  app.post("/jwt", (req, res) => {
    res.json({ info: get(req, "extension", "no-data") });
  });
};

export default router;
