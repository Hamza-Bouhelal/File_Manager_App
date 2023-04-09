import { userService } from "../src/services/userService";

async function runQuery(query: string) {
  await new userService().db.all(query, [], (err, row) => {
    if (err) {
      console.log(err);
    } else {
      console.log(row);
    }
  });
}

runQuery("SELECT * FROM users");
