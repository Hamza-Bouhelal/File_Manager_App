import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { config } from "../utils/config";
const useStyles = makeStyles({
  directory: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  header: {
    marginTop: 0,
  },
  files: {
    display: "flex",
    flexWrap: "wrap",
  },
  folders: {
    display: "flex",
    flexWrap: "wrap",
  },
  file: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)",
  },
  folder: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)",
  },
  fileLink: {
    color: "#333",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 600,
    marginLeft: "10px",
  },
  fileIcon: {
    marginRight: "10px",
    fontSize: "24px",
    color: "#333",
  },
  folderLink: {
    color: "#333",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 600,
    marginLeft: "10px",
  },
  folderIcon: {
    marginRight: "10px",
    fontSize: "24px",
    color: "#333",
  },
});

const Directory = () => {
  const classes = useStyles();
  const initArray: { name: string }[] = [];
  const [files, setFiles] = useState(initArray);
  const [folders, setFolders] = useState(initArray);
  const directory = "./" + localStorage.getItem("dir") || "";
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
      <div className={classes.file}>
        <a href="">{name}</a>
      </div>
    );
  };

  const Folder = ({ name }: { name: string }) => {
    return (
      <div className={classes.folder} onClick={handleFolderClick(name)}>
        <a href="#">{name}</a>
      </div>
    );
  };

  return (
    <div className={classes.directory}>
      <h2 className={classes.header}>Directory: {directory}</h2>
      {done ? (
        <div>
          {localStorage.getItem("dir") != "" ? <Folder name=".." /> : <div />}
          <div className={classes.folders}>
            {folders.map((folder) => (
              <Folder name={folder.name} />
            ))}
          </div>
          <div className={classes.files}>
            {files.map((file) => (
              <File name={file.name} />
            ))}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Directory;
