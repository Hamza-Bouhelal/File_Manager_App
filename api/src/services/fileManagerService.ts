import fs from "fs";

export class fileManagerService {
  static createRootFolder(username: string) {
    const path = `./data/${username}`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  static deleteRootDirectory(username: string) {
    const path = `./data/${username}`;
    if (fs.existsSync(path)) {
      fs.rm(path, { recursive: true }, (err) => {
        console.log(err);
      });
    }
  }

  static createFileText(
    username: string,
    filePath: string,
    fileName: string,
    content: any
  ) {
    const path = `./data/${username}${filePath}/`;
    if (!fs.existsSync(path)) {
      return { status: 400, message: "Path does not exist" };
    }
    if (!fs.existsSync(path + fileName)) {
      fs.writeFileSync(path + fileName, content);
      return { status: 201, message: "File created" };
    } else {
      return { status: 400, message: "File already exists" };
    }
  }

  static DeleteFileOrFolder(username: string, fullPath: string) {
    const path = `./data/${username}/${fullPath}`;
    if (fs.existsSync(path)) {
      fs.rm(path, { recursive: true }, (err) => {
        if (err) console.log(err);
      });
      return { status: 200, message: "File or folder deleted" };
    } else {
      return { status: 400, message: "File or folder does not exist" };
    }
  }

  static getFileText(username: string, fullPath: string) {
    const path = `./data/${username}/${fullPath}`;
    console.log(path);
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, "utf8");
      return { status: 200, message: "File found", content };
    }
    return { status: 400, message: "File does not exist" };
  }
}
