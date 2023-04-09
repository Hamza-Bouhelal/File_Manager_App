//this is a service class for pulling and writing data into db.sqlite3
import sqlite3 from "sqlite3";
import { User } from "../types/users";
import { hash, compare } from "bcrypt";
import { Response } from "express";
import { defaultErrorHandler } from "../middleware/errorHansler";
import { sign, verify } from "jsonwebtoken";
import { fileManagerService } from "./fileManagerService";
import { allteredRequest } from "../middleware/authValidator";

export const ACCESS_TOKEN_SECRET = "test";
export const REFRESH_TOKEN_SECRET = "tset";

function generateAccessToken(user: { username: string }) {
  return sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

function generateRefreshToken(user: { username: string }) {
  return sign(user, REFRESH_TOKEN_SECRET);
}

function auth(user: { username: string }) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  userService.refreshTokens.push(refreshToken);
  return { accessToken, refreshToken };
}

export class userService {
  static refreshTokens: string[] = [];
  public db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database("./db.sqlite3", (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Connected to the database.");
      }
    });
  }

  logout(res: Response, token: string) {
    userService.refreshTokens = userService.refreshTokens.filter(
      (t) => t !== token
    );
    res.status(200).send({ message: "Logged out" });
  }

  async createUser(user: User) {
    let { username, password } = user;
    password = await hash(password, 10);
    await this.db.run(
      `INSERT INTO users(username, password) VALUES(?, ?)`,
      [username, password],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      }
    );
  }

  async checkExists(user: User) {
    let { username } = user;
    return new Promise<boolean>(async (resolve, reject) => {
      await this.db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }
      );
    });
  }

  refreshToken(res: Response, token: string) {
    if (!token) return res.status(401).send({ message: "No token provided" });
    if (!userService.refreshTokens.includes(token))
      return res.status(403).send({ message: "Invalid token" });
    verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).send({ message: "Invalid token" });
      res.status(200).send({
        accessToken: generateAccessToken({
          username: (user as { username: string }).username,
        }),
      });
    });
  }

  async signUp(user: User, res: Response) {
    await defaultErrorHandler(res, async () => {
      if (await this.checkExists(user)) {
        res.status(400).send({ message: "User already exists" });
      } else {
        await this.createUser(user);
        res.status(201).send({ message: "User created", ...auth(user) });
        fileManagerService.createRootFolder(user.username);
      }
    });
  }

  async userExists(user: User) {
    return new Promise<boolean>(async (resolve, reject) => {
      await this.db.get(
        `SELECT * FROM users WHERE username = ?`,
        [user.username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }
      );
    });
  }

  async deleteUser(req: allteredRequest, res: Response) {
    const { username } = req.user as unknown as User;
    await defaultErrorHandler(res, async () => {
      await this.db.run(
        `DELETE FROM users WHERE username = ?`,
        [username],
        function (err) {
          if (err) {
            return console.log(err.message);
          }
          console.log(`A row has been deleted with rowid ${this.lastID}`);
        }
      );
      if (await this.userExists(req.user as unknown as User)) {
        res
          .status(400)
          .send({ message: "Some error occured while deleting the user" });
      } else {
        fileManagerService.deleteRootDirectory(username);
        res.status(200).send({ message: "User deleted" });
      }
    });
  }

  async getPassword(username: string) {
    return new Promise<string>(async (resolve, reject) => {
      await this.db.get(
        `SELECT password FROM users WHERE username = ?`,
        [username],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(row.password);
            } else {
              resolve("");
            }
          }
        }
      );
    });
  }

  async login(user: User, res: Response) {
    await defaultErrorHandler(res, async () => {
      let { username, password } = user;
      let storedPassword = await this.getPassword(username);
      if (storedPassword) {
        if (await compare(password, storedPassword)) {
          res.status(200).send({ message: "Logged in", ...auth({ username }) });
        } else {
          res.status(400).send({ message: "Wrong password" });
        }
      } else {
        res.status(400).send({ message: "User does not exist" });
      }
    });
  }
}
