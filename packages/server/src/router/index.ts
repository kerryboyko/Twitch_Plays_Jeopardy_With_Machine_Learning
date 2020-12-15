import { Application } from "express";
import middleware from "./middleware";
import postUserId from "./post/userid";

const router = (app: Application, apiToken: string) => {
  middleware(app);
  postUserId(app, apiToken);
};

export default router;
