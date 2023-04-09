import express from "express";
import {
  authValidator,
  deleteFileOrFolderValidator,
  fileTextValidator,
  joiBodyValidator,
  readDirValidator,
  readFileValidator,
  tokenValidator,
} from "./middleware/joi";
import { userService } from "./services/userService";
import { User } from "./types/users";
import { allteredRequest, validateAuth } from "./middleware/authValidator";
import { fileManagerService } from "./services/fileManagerService";
import fileUpload from "express-fileupload";
import mime from "mime-types";

var app = express();
export const userServiceHandler = new userService();
app.use(express.json());
var HTTP_PORT = 8000;

app.post("/users/signup", async (req, res, next) => {
  if (!joiBodyValidator(res, authValidator, req.body)) return;
  await userServiceHandler.signUp(req.body as User, res);
});

app.post("/users/login", async (req, res, next) => {
  if (!joiBodyValidator(res, authValidator, req.body)) return;
  await userServiceHandler.login(req.body as User, res);
});

app.post("/users/refresh", async (req, res, next) => {
  if (!joiBodyValidator(res, tokenValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    await userServiceHandler.refreshToken(res, req.body.token);
  });
});

app.delete("/users/logout", async (req, res, next) => {
  if (!joiBodyValidator(res, tokenValidator, req.body)) return;
  userServiceHandler.logout(res, req.body.token);
});

app.delete("/users", async (req, res, next) => {
  validateAuth(req as allteredRequest, res, async () => {
    await userServiceHandler.deleteUser(req as allteredRequest, res);
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
  if (!joiBodyValidator(res, deleteFileOrFolderValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    const { status, message } = fileManagerService.DeleteFileOrFolder(
      (req as allteredRequest).user.username,
      req.body.path
    );
    res.status(status).send({ message });
  });
});

app.post("/users/files/text/read", async (req, res, next) => {
  if (!joiBodyValidator(res, readFileValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    const { status, message, content } = fileManagerService.getFileText(
      (req as allteredRequest).user.username,
      req.body.path,
      req.body.file
    );
    res.status(status).send({ message, content });
  });
});

app.post("/users/files/buffer/read", async (req, res, next) => {
  if (!joiBodyValidator(res, readFileValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    const result = fileManagerService.readBufferFile(
      (req as allteredRequest).user.username,
      req.body.path,
      req.body.file
    );
    res
      .status(result.status)
      .set("Content-Type", mime.lookup(req.body.file) || "text/plain")
      .send(result.status == 200 ? result.buffer : { message: result.message });
  });
});

app.post("/users/files/folder", async (req, res, next) => {
  if (!joiBodyValidator(res, deleteFileOrFolderValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    const { status, message } = fileManagerService.createFolder(
      (req as allteredRequest).user.username,
      req.body.path
    );
    res.status(status).send({ message });
  });
});

app.post("/users/files/buffer/", fileUpload(), async (req, res, next) => {
  validateAuth(req as unknown as allteredRequest, res, async () => {
    const result = fileManagerService.createFileBuffer(
      (req as unknown as allteredRequest).user.username,
      req.body.path,
      req.files as object
    );
    res.status(result.status).send({ ...result, status: undefined });
  });
});

app.post("/users/folders", async (req, res, next) => {
  if (!joiBodyValidator(res, readDirValidator, req.body)) return;
  validateAuth(req as allteredRequest, res, async () => {
    const result = fileManagerService.getFolder(
      (req as allteredRequest).user.username,
      req.body.path
    );
    res.status(result.status).send({ ...result, status: undefined });
  });
});

app.post("/users/folders/zip", fileUpload(), async (req, res, next) => {
  validateAuth(req as allteredRequest, res, async () => {
    const result = fileManagerService.createFoldersAndFilesFromZip(
      (req as allteredRequest).user.username,
      req.body.path,
      req.files as object
    );
    res.status(result.status).send({ ...result, status: undefined });
  });
});

app.listen(HTTP_PORT, () => {
  console.log(
    "Server running on port %PORT%".replace("%PORT%", HTTP_PORT.toString())
  );
});
