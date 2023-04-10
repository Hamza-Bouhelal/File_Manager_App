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
  await new userService().db.run(query);
}

/* runQueryAll("SELECT * FROM users"); */

runQuery("DELETE FROM users");
