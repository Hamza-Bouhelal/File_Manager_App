//this is a service class for pulling and writing data into db.sqlite3
import sqlite3 from "sqlite3";
import { User } from "../types/users";
import { hash, compare } from "bcrypt";
import { Response } from "express";
import { sign, verify } from "jsonwebtoken";
import { fileManagerService } from "./fileManagerService";
import { allteredRequest } from "../middleware/authValidator";

export const ACCESS_TOKEN_SECRET = "TSF2b8uYo8bQacrFSGJ7";
export const REFRESH_TOKEN_SECRET = "HdDCPyDR4cNjdNrJAid2";

function generateAccessToken(user: { username: string }) {
  return sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

function generateRefreshToken(user: { username: string }) {
  return sign(user, REFRESH_TOKEN_SECRET);
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

  async pullRefreshTokens() {
    await this.db.all("SELECT * FROM refreshTokens", [], (err, row) => {
      if (err) {
        console.log(err);
      } else {
        if (row.length)
          userService.refreshTokens = row.map((row: any) => row.token);
      }
    });
  }

  async auth(user: { username: string }) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    userService.refreshTokens.push(refreshToken);
    await this.addRefreshTokenToDb(refreshToken);
    return { accessToken, refreshToken };
  }

  async addRefreshTokenToDb(token: string) {
    await this.db.run(
      `INSERT INTO refreshTokens(token) VALUES(?)`,
      [token],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
      }
    );
  }

  async deleteRefreshTokenFromDb(token: string) {
    await this.db.run(
      `DELETE FROM refreshTokens WHERE token = ?`,
      [token],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
      }
    );
  }

  async logout(res: Response, token: string) {
    let user: { username: string };
    try {
      user = verify(token, REFRESH_TOKEN_SECRET) as { username: string };
    } catch {
      return res.status(403).send({ message: "Invalid token" });
    }
    userService.refreshTokens = userService.refreshTokens.filter(
      async (token: string) => {
        try {
          const decodedToken = verify(token, REFRESH_TOKEN_SECRET);
          if ((decodedToken as User).username !== user.username) {
            await this.deleteRefreshTokenFromDb(token);
          }
          return (decodedToken as User).username !== user.username;
        } catch (error) {
          return false;
        }
      }
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
    if (await this.checkExists(user)) {
      res.status(400).send({ message: "User already exists" });
    } else {
      await this.createUser(user);
      res
        .status(201)
        .send({ message: "User created", ...(await this.auth(user)) });
      fileManagerService.createRootFolder(user.username);
    }
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
    await this.db.run(
      `DELETE FROM users WHERE username = ?`,
      [username],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
      }
    );
    if (await this.userExists(req.user as unknown as User)) {
      res
        .status(400)
        .send({ message: "Some error occured while deleting the user" });
    } else {
      try {
        fileManagerService.deleteRootDirectory(username);
        res.status(200).send({ message: "User deleted" });
      } catch (error) {
        res
          .status(400)
          .send({ message: "Some error occured while deleting the user" });
      }
    }
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
    let { username, password } = user;
    let storedPassword = await this.getPassword(username);
    if (storedPassword) {
      if (await compare(password, storedPassword)) {
        res
          .status(200)
          .send({ message: "Logged in", ...(await this.auth({ username })) });
      } else {
        res.status(400).send({ message: "Wrong password" });
      }
    } else {
      res.status(400).send({ message: "User does not exist" });
    }
  }
}
