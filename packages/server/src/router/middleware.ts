/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import get from "lodash/get";
import config from "../config";
// dumb route logger.
const routeLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(req.originalUrl);
  next();
};

const jwtParser = (
  req: Request & { extension?: any },
  res: Response,
  next: NextFunction
): void => {
  if (!req.headers.authorization) {
    res
      .status(401)
      .json({ error: true, message: "Missing authorization header" });
    return;
  }
  const [type, auth] = get(req, "headers.authorization", "").split(" ");
  if (type !== "Bearer") {
    res
      .status(401)
      .json({ error: true, message: "Invalid authorization header" });
    return;
  }

  jwt.verify(
    auth,
    config.JEOPARDY_INTERACTION_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        console.log("JWT Error", err);
        res.status(401).json({ error: true, message: "Invalid authorization" });
        return;
      }
      req.extension = decoded;
      console.log("Extension Data", req.extension);
      next();
    }
  );
};

export const middleware = (app: Application): void => {
  app.use(routeLogger);
  app.use("/jwt", jwtParser);
};

export default middleware;
