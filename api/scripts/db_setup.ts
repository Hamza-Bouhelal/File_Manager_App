import fs from "fs";
import { userService } from "../src/services/userService";

async function setupDb() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  if (!fs.existsSync("./db.sqlite3")) {
    fs.writeFileSync("./db.sqlite3", "");
    //create user table with primary key id autoincrement, username, password
    await new userService().db.run(
      "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
    );
  }
}

setupDb();
