import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { config } from "../utils/config";
import Title from "./Title";
import { addTextFile, refresh } from "../utils/req";
import { Logout } from "./Logout";
import CustomButton from "./CustomModal";
import { setToast } from "../App";

const useStyles = makeStyles({
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px",
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
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #ddd",
    transition: "background-color 0.2s ease-out",
    ":hover": {
      backgroundColor: "#f1f1f1",
      transition: "background-color 0.5s ease-in-out",
    },
  },
  tableData: {
    width: "80%",
    padding: "10px",
  },
  cursorPointer: {
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "120px",
    marginLeft: "20px",
    zIndex: -99,
  },
});

const Directory = () => {
  const classes = useStyles();
  const initArray: { name: string }[] = [];
  const [files, setFiles] = useState(initArray);
  const [folders, setFolders] = useState(initArray);
  const directory = "./" + localStorage.getItem("dir") || "";
  const [done, setDone] = useState(false);

  const fetchData = async () => {
    setDone(false);
    if (!(await refresh(localStorage.getItem("refreshToken") as string))) {
      localStorage.setItem("accessToken", "");
      localStorage.setItem("refreshToken", "");
      window.location.href = "/";
    }
    const response = await fetch(config.backendurl + "/users/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({ path: localStorage.getItem("dir") }),
    });
    const data = await response.json();
    setFiles(data.files.map((file: string) => ({ name: file })));
    setFolders(data.folders.map((folder: string) => ({ name: folder })));
    setDone(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileClick = (event: Event) => {
    event.preventDefault();
    alert("Clicked on a file!");
  };

  const handleFolderClick = (name: string) => {
    return (event: any) => {
      event.preventDefault();
      if (name != "..") {
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

  const File = ({ name }: { name: string }) => {
    return (
      <div className={classes.cursorPointer}>
        <tr className={classes.tableRow}>
          <td className={classes.tableData}>{name}</td>
        </tr>
      </div>
    );
  };

  const Folder = ({ name }: { name: string }) => {
    return (
      <div onClick={handleFolderClick(name)} className={classes.cursorPointer}>
        <tr className={classes.tableRow}>
          <td className={classes.tableData}>{name}</td>
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
        type: "success",
        hide: false,
      });
      fetchData();
      return true;
    }
    {
      setToast({
        message:
          "File could not be added (" +
          ((await response.json()) as { message: string }).message +
          ")",
        type: "error",
        hide: false,
      });
      return false;
    }
  };

  return (
    <div>
      <Title text="Safe Drive"></Title>
      <Logout />
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
      </div>
      {done ? (
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
                <Folder name=".." />
              ) : (
                <div />
              )}
              {folders.map((folder) => (
                <Folder name={folder.name} />
              ))}
              {files.map((file) => (
                <File name={file.name} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Directory;
