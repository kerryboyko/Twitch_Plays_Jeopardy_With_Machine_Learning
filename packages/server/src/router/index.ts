import { Application } from "express";
import middleware from "./middleware";
import postUserId from "./post/userid";
import get from "lodash/get";

const router = (app: Application, apiToken: string): void => {
  middleware(app);
  postUserId(app, apiToken);
  app.get("/hello", (_req, res) => {
    res.send("Hello World");
  });
  app.get("/", (_req, res) => {
    res.send("App is running");
  });
  app.use("/frontend");
  app.post("/jwt", (req, res) => {
    res.json({ info: get(req, "extension", "no-data") });
  });
};

export default router;
