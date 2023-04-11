import { userService } from "../src/services/userService";

async function runQueryAll(query: string) {
  await new userService().db.all(query, [], (err, row) => {
    if (err) {
      console.log(err);
    } else {
      console.log(row);
    }
  });
}
async function runQuery(query: string) {
  await new userService().db.run(query, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("success");
    }
  });
}

/* runQueryAll("SELECT * FROM users"); */

runQuery(
  "CREATE TABLE refreshTokens (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT)"
);
