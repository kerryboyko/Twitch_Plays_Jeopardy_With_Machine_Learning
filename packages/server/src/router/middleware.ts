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
  const authHeader = get(req, "headers.authorization", "");
  const [type, auth] = authHeader.split(" ");
  if (type !== "Bearer") {
    res
      .status(401)
      .json({ error: true, message: "Invalid authorization header" });
    return;
  }

  jwt.verify(
    auth,
    Buffer.from(config.JEOPARDY_INTERACTION_EXTENSION_SECRET, "base64"),
    (err: any, decoded: any) => {
      if (err) {
        console.log("JWT Error", err);
        res.status(401).json({ error: true, message: "Invalid authorization" });
        return;
      }
      req.extension = decoded;
      next();
    }
  );
};

export const middleware = (app: Application): void => {
  app.use(routeLogger);
  app.use(jwtParser);
};

export default middleware;
