import express from "express";
import {
  authValidator,
  deleteOrReadFileOrFolderValidator,
  fileTextValidator,
  joiBodyValidator,
  tokenValidator,
} from "./middleware/joi";
import { userService } from "./services/userService";
import { User } from "./types/users";
import { allteredRequest, validateAuth } from "./middleware/authValidator";
import { fileManagerService } from "./services/fileManagerService";

var app = express();
export const userServiceHandler = new userService();
app.use(express.json());
var HTTP_PORT = 8000;

app.post("/users/signup", async (req, res, next) => {
  joiBodyValidator(res, authValidator, req.body);
  await userServiceHandler.signUp(req.body as User, res);
});

app.post("/users/login", async (req, res, next) => {
  joiBodyValidator(res, authValidator, req.body);
  await userServiceHandler.login(req.body as User, res);
});

app.post("/users/refresh", async (req, res, next) => {
  joiBodyValidator(res, tokenValidator, req.body);
  validateAuth(req as allteredRequest, res, async () => {
    await userServiceHandler.refreshToken(res, req.body.token);
  });
});

app.delete("/users/logout", async (req, res, next) => {
  joiBodyValidator(res, tokenValidator, req.body);
  userServiceHandler.logout(res, req.body.token);
});

app.delete("/users", async (req, res, next) => {
  validateAuth(req as allteredRequest, res, async () => {
    await userServiceHandler.deleteUser(req as allteredRequest, res);
  });
});

app.get("/users", async (req, res, next) => {
  validateAuth(req as allteredRequest, res, async () => {
    res.status(200).send({
      ...(await userServiceHandler.getAllUsers()),
      user: (req as allteredRequest).user,
    });
  });
});

app.post("/users/files/text", async (req, res, next) => {
  if (!joiBodyValidator(res, fileTextValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    const { status, message } = fileManagerService.createFileText(
      (req as allteredRequest).user.username,
      req.body.path,
      req.body.file,
      req.body.content
    );
    res.status(status).send({ message });
  });
});

app.delete("/users/files", async (req, res, next) => {
  if (!joiBodyValidator(res, deleteOrReadFileOrFolderValidator, req.body))
    return;
  validateAuth(req as allteredRequest, res, async () => {
    const { status, message } = fileManagerService.DeleteFileOrFolder(
      (req as allteredRequest).user.username,
      req.body.path
    );
    res.status(status).send({ message });
  });
});

app.post("/users/files", async (req, res, next) => {
  if (!joiBodyValidator(res, deleteOrReadFileOrFolderValidator, req.body))
    return;
  validateAuth(req as allteredRequest, res, async () => {
    const { status, message } = fileManagerService.getFileText(
      (req as allteredRequest).user.username,
      req.body.path
    );
    res.status(status).send({ message });
  });
});

app.listen(HTTP_PORT, () => {
  console.log(
    "Server running on port %PORT%".replace("%PORT%", HTTP_PORT.toString())
  );
});
