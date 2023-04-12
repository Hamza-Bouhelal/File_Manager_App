import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { config } from "../utils/config";
import Title from "./Title";
import {
  addFileFromBuffer,
  addFolder,
  addFolderFromZip,
  addTextFile,
  refresh,
} from "../utils/req";
import { Logout } from "./Logout";
import CustomButton from "./CustomModal";
import { setToast } from "../App";
import { ToastType } from "./utils/Toast";
import BurgerMenu from "./BurgerMenu";
import { FileIcon, FolderIcon } from "./utils/svgs";

/* 
FIX:
burger menu icon
burgerMenu close all
last burger menu item not showing
*/
const useStyles = makeStyles({
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px",
    height: "120%",
    marginBottom: "100px",
    zIndex: -99,
  },
  table: {
    width: "90%",
    borderCollapse: "separate",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
  },
  tableHead: {
    backgroundColor: "#E9EDF1",
    borderRadius: "10px 10px 0 0",
    height: "60px",
    textAlign: "left",
    paddingLeft: "20px",
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
    backgroundColor: "inherit",
    transition: "inherit",
  },
  tableData: {
    width: "80%",
    padding: "10px",
    backgroundColor: "inherit",
    transition: "inherit",
  },
  cursorPointer: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f1f1f1",
      transition: "background-color 0.5s ease-in-out",
    },
  },
  buttonGroup: {
    display: "flex",
    marginTop: "120px",
    marginLeft: "5%",
    zIndex: -99,
  },
  loaderContainer: {
    width: "100%",
    marginTop: "200px",
    display: "flex",
    justifyContent: "center",
  },
  spinner: {
    width: 64,
    height: 64,
    border: "8px solid",
    borderColor: "#E9EDF1 transparent #E9EDF1 transparent",
    borderRadius: "50%",
    animation: "$spinAnim 1.2s linear infinite",
  },
  "@keyframes spinAnim": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  burgerMenu: {
    marginRight: "10px",
  },
});
export let fetchData: () => Promise<void>;
const Directory = () => {
  const classes = useStyles();
  const initArray: { name: string }[] = [];
  const [files, setFiles] = useState(initArray);
  const [folders, setFolders] = useState(initArray);
  const directory = "./" + localStorage.getItem("dir") || "";
  const [done, setDone] = useState(false);

  fetchData = async () => {
    setDone(false);
    if (!(await refresh(localStorage.getItem("refreshToken") as string))) {
      localStorage.setItem("accessToken", "");
      localStorage.setItem("refreshToken", "");
      window.location.href = "/";
    }
    const req = async () => {
      return await fetch(config.backendurl + "/users/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
        body: JSON.stringify({ path: localStorage.getItem("dir") }),
      });
    };
    let response = await req();
    let count = 0;
    while (response.status != 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = await req();
      count++;
      if (count > 5) {
        setToast({
          type: ToastType.Error,
          message: "Error fetching data, Please login again",
          open: true,
        });
        localStorage.setItem("accessToken", "");
        localStorage.setItem("refreshToken", "");
        new Promise(() =>
          setTimeout(() => {
            window.location.href = "/";
          }, 3000)
        );
        return;
      }
    }
    const data = await response?.json();
    setFiles(data.files.map((file: string) => ({ name: file })));
    setFolders(data.folders.map((folder: string) => ({ name: folder })));
    setDone(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFolderClick = (name: string) => {
    return (event: any) => {
      event.preventDefault();
      if (name != ". .") {
        localStorage.setItem("dir", localStorage.getItem("dir") + name + "/");
      } else {
        const path = localStorage.getItem("dir") as string;
        const newPath = path.substring(0, path.length - 1);
        const newPath2 = newPath.substring(0, newPath.lastIndexOf("/") + 1);
        localStorage.setItem("dir", newPath2);
      }
      window.location.reload();
    };
  };

  const handleFileClick = (name: string) => {
    const path = localStorage.getItem("dir");
    const accessToken = localStorage.getItem("accessToken");
    window.open(
      config.backendurl +
        "/users/files/buffer/read?path=" +
        path +
        "&file=" +
        name +
        "&token=" +
        accessToken,
      "_blank"
    );
  };

  function shortenString(str: string): string {
    if (str.length > 20) {
      return str.slice(0, 20) + "...";
    }
    return str;
  }

  const File = ({ name, last }: { name: string; last: boolean }) => {
    return (
      <div className={classes.cursorPointer}>
        <tr className={classes.tableRow}>
          <td
            className={classes.tableData}
            onClick={() => handleFileClick(name)}
          >
            <span style={{ display: "flex" }}>
              <FileIcon />
              <div style={{ marginLeft: "10px" }}>{shortenString(name)}</div>
            </span>
          </td>
          <div className={classes.burgerMenu}>
            <BurgerMenu fileName={name} last={last} />
          </div>
        </tr>
      </div>
    );
  };

  const Folder = ({ name, last }: { name: string; last: boolean }) => {
    return (
      <div className={classes.cursorPointer}>
        <tr className={classes.tableRow}>
          <td className={classes.tableData} onClick={handleFolderClick(name)}>
            <span style={{ display: "flex" }}>
              {name != ". ." ? <FolderIcon /> : <div />}
              <div style={{ marginLeft: name != ". ." ? "10px" : "30px" }}>
                {shortenString(name)}
              </div>
            </span>
          </td>
          <div className={classes.burgerMenu}>
            <BurgerMenu fileName={name} last={last} />
          </div>
        </tr>
      </div>
    );
  };

  const customAddFile = async (args: any) => {
    const path = localStorage.getItem("dir") as string;
    const fileName = args.inputs[0];
    const fileContent = args.textArea[0];
    const response = await addTextFile(path, fileName, fileContent);
    if (response.status === 201) {
      setToast({
        message: "File added successfully",
        type: ToastType.Success,
        hide: false,
      });
      fetchData();
      return true;
    } else {
      setToast({
        message:
          "File or Folder could not be added (" +
          ((await response.json()) as { message: string }).message +
          ")",
        type: ToastType.Error,
        hide: false,
      });
      return false;
    }
  };

  const customAddFolder = async (args: any) => {
    const folderName = args.inputs[0];
    const response = await addFolder(folderName);
    if (response.status === 201) {
      setToast({
        message: "Folder added successfully",
        type: ToastType.Success,
        hide: false,
      });
      fetchData();
      return true;
    } else {
      setToast({
        message:
          "Folder could not be added (" +
          ((await response.json()) as { message: string }).message +
          ")",
        type: ToastType.Error,
        hide: false,
      });
      return false;
    }
  };
  const customAddBufferFile = async (args: any) => {
    const path = localStorage.getItem("dir") as string;
    const data = args.filePickers[0] as FormData;
    data.append("path", path);
    const response = await addFileFromBuffer(data);
    const json = await response.json();
    const filesAlreadyExists = json.filesAlreadyExists;
    if (filesAlreadyExists.length === 0) {
      setToast({
        message: "File added successfully",
        type: ToastType.Success,
        hide: false,
      });
      setTimeout(fetchData, 1000);
      return true;
    } else {
      setToast({
        message:
          "The following files could not be added (" +
          (
            (await response.json()) as { filesAlreadyExists: string[] }
          ).filesAlreadyExists.join(", ") +
          ")",
        type: ToastType.Error,
        hide: false,
      });
      return false;
    }
  };

  const customAddZip = async (args: any) => {
    const path = localStorage.getItem("dir") as string;
    const data = args.filePickers[0] as FormData;
    data.append("path", path);
    const response = await addFolderFromZip(data);
    if (response.status === 201) {
      setToast({
        message: "Folder added successfully",
        type: ToastType.Success,
        hide: false,
      });
      setTimeout(fetchData, 1000);
      return true;
    } else {
      setToast({
        message:
          "Folder could not be added (" +
          ((await response.json()) as { message: string }).message +
          ")",
        type: ToastType.Error,
        hide: false,
      });
      return false;
    }
  };

  return (
    <div>
      <Logout />
      {done ? (
        <div>
          <div className={classes.buttonGroup}>
            <CustomButton
              buttonText="Add text file"
              modalElements={{
                inputs: ["File Name"],
                textArea: ["File Content"],
                filePickers: [],
              }}
              handleConfirm={customAddFile}
            />
            <CustomButton
              buttonText="Add Folder"
              modalElements={{
                inputs: ["Folder Name"],
                textArea: [],
                filePickers: [],
              }}
              handleConfirm={customAddFolder}
            />
            <CustomButton
              buttonText="Upload Files"
              modalElements={{
                inputs: [],
                textArea: [],
                filePickers: [
                  { fileType: "", label: "Your files to be uploaded" },
                ],
              }}
              handleConfirm={customAddBufferFile}
              filePickerMultiple={true}
            />
            <CustomButton
              buttonText="Upload Zip File"
              modalElements={{
                inputs: [],
                textArea: [],
                filePickers: [
                  { fileType: ".zip", label: "Your file to be extracted" },
                ],
              }}
              handleConfirm={customAddZip}
            />
          </div>
          <div className={classes.container}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th colSpan={2} className={classes.tableHead}>
                    {directory}
                  </th>
                </tr>
              </thead>

              <tbody>
                {localStorage.getItem("dir") != "" ? (
                  <Folder name=". ." last={false} />
                ) : (
                  <div />
                )}
                {folders.map((folder, idx) => (
                  <Folder
                    name={folder.name}
                    last={idx === folders.length - 1 && files.length === 0}
                  />
                ))}
                {files.map((file, idx) => (
                  <File name={file.name} last={idx === files.length - 1} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={classes.loaderContainer}>
          <div className={classes.spinner}></div>
        </div>
      )}
    </div>
  );
};

export default Directory;
