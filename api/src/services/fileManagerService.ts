import fs from "fs";
import decompress from "decompress";
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

  static getFileText(username: string, path: string, filename: string) {
    const fullPath = `./data/${username}${path}/${filename}`;
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      return { status: 200, message: "File found", content };
    }
    return { status: 400, message: "File does not exist" };
  }

  static createFolder(username: string, path: string) {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    const fullPath = `./data/${username}${path}`;
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
      return { status: 201, message: "Folder created" };
    }
    return { status: 400, message: "Folder already exists" };
  }

  static createFileBuffer(username: string, path: string, files: object) {
    if (!files) return { status: 400, message: "No files to upload" };
    const filesNotCreated: string[] = [];
    const createdFiles: string[] = [];
    const fullPath = `./data/${username}/${path}`;
    for (const [key, value] of Object.entries(files)) {
      const filePath = (fullPath + "/" + key).replace(/\/\//g, "/");
      if (fs.existsSync(filePath)) {
        filesNotCreated.push(key);
      } else {
        fs.writeFileSync(filePath, value.data);
        createdFiles.push(key);
      }
    }
    return {
      status: filesNotCreated.length > 0 ? 400 : 201,
      createdFiles,
      filesAlreadyExists: filesNotCreated,
    };
  }

  static getFolder(username: string, path: string) {
    const folders: string[] = [];
    const files: string[] = [];
    const fullPath = `./data/${username}/${path}`;
    if (fs.existsSync(fullPath)) {
      fs.readdirSync(fullPath).forEach((file) => {
        const filePath = (fullPath + "/" + file).replace(/\/\//g, "/");
        if (fs.statSync(filePath).isDirectory()) {
          folders.push(file);
        } else {
          files.push(file);
        }
      });
      return { status: 200, folders, files };
    } else {
      return { status: 400, message: "Folder does not exist" };
    }
  }

  static createFoldersAndFilesFromZip(
    username: string,
    path: string,
    files: object
  ) {
    if (!files) return { status: 400, message: "No zip file was provided" };
    const fullPath = `./data/${username}/${path}`;
    if (!fs.existsSync(fullPath)) {
      return { status: 400, message: "Path does not exist" };
    }
    if (Object.entries(files).length > 1)
      return { status: 400, message: "Only one zip file can be uploaded" };
    const [key, value] = Object.entries(files)[0];
    if (key != "file") {
      return { status: 400, message: "Place you zip file under 'file'" };
    }
    try {
      decompress(value.data, fullPath);
      return { status: 201, message: "Content from zip file Was added" };
    } catch (error) {
      return { status: 400, message: "Error extracting zip file" };
    }
  }

  static readBufferFile(username: string, path: string, filename: string) {
    const fullPath = `./data/${username}${path}/${filename}`;
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      return { status: 200, buffer };
    } else {
      return { status: 400, message: "File does not exist" };
    }
  }

  static renameFileOrFolder(username: string, path: string, newPath: string) {
    const fullPath = `./data/${username}/${path}`;
    const newFullPath = `./data/${username}/${newPath}`;
    if (fs.existsSync(fullPath)) {
      try {
        fs.renameSync(fullPath, newFullPath);
        return { status: 200, message: "File or folder renamed" };
      } catch (err) {
        console.log(err);
        return { status: 400, message: "Some error occured" };
      }
    } else {
      return { status: 400, message: "File or folder does not exist" };
    }
  }
}
