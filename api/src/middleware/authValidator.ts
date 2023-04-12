import { verify } from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  userService,
} from "../services/userService";
import { Request, Response } from "express";
import { User } from "../types/users";
import { userServiceHandler } from "../app";

export interface allteredRequest extends Request {
  user: User;
}

export async function validateAuth(
  req: allteredRequest,
  res: Response,
  call: () => Promise<void>,
  tokenFromQuery?: string
) {
  const authHeader = (req.headers as unknown as { authorization: string })
    .authorization;
  const token = tokenFromQuery || (authHeader && authHeader.split(" ")[1]);
  if (token == null) {
    res.status(401).send({ message: "Unauthorized" });
    return false;
  }
  await verify(token, ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      res.status(403).send({ message: "Unauthorized" });
      return false;
    }
    let hasRefreshToken = false;
    userService.refreshTokens.forEach((refreshToken) => {
      try {
        const decodedToken = verify(refreshToken, REFRESH_TOKEN_SECRET);
        hasRefreshToken =
          (decodedToken as User).username === (user as User).username;
      } catch (err) {
        hasRefreshToken = false;
      }
    });
    if (!hasRefreshToken) {
      res.status(403).send({ message: "Unauthorized" });
      return false;
    }
    if (await userServiceHandler.checkExists(user as User)) {
      req.user = user as User;
      await call();
      return true;
    }
    res.status(403).send({ message: "Unauthorized" });
    return false;
  });
}
