import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ModalComponent from "./CustomModal";
import { deleteFileOrFolder, renameFileOrFolder } from "../utils/req";
import { setToast } from "../App";
import { ToastType } from "./utils/Toast";
import { fetchData } from "./Drive";
import { BurgerMenuIcon } from "./utils/svgs";

const useStyles = makeStyles({
  container: {
    height: "100px",
    width: "20px",
  },
  burgerMenu: {
    position: "relative",
    display: "inline-block",
    cursor: "pointer",
    marginLeft: "600px",
  },
  menuIcon: {
    width: "20px",
    height: "2px",
    backgroundColor: "black",
    margin: "3px 0",
    transition: "0.4s",
    overflow: "visible",
  },
  menuOptions: {
    position: "absolute",
    top: "16px",
    right: "0",
    backgroundColor: "#f9f9f9",
    padding: "5px",
    boxShadow: "0 2px 4px 0 rgba(0,0,0,0.2)",
    transform: "translateX(-25px)",
  },
  option: {
    fontSize: "12px",
    padding: "5px 10px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#ddd",
    },
  },
  deleteOption: {
    color: "red",
  },
  last: {
    top: "-20px",
  },
});

const BurgerMenu = ({
  fileName,
  last = false,
}: {
  fileName: string;
  last?: boolean;
}) => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const resetOpenState = () => setIsOpen(false);
    document.addEventListener("burgerMenuToggle", resetOpenState);
    return () => {
      document.removeEventListener("burgerMenuToggle", resetOpenState);
    };
  }, []);

  const handleToggleMenu = () => {
    document.dispatchEvent(new Event("burgerMenuToggle"));
    setIsOpen(!isOpen);
  };

  const handleRename = async (args: any) => {
    const newName = args.inputs[0];
    const response = await renameFileOrFolder(fileName, newName);
    if (response.status === 200) {
      setToast({
        message: "File renamed successfully",
        type: "success",
        hide: false,
      });
    } else {
      setToast({
        message:
          "File rename failed (" +
          ((await response.json()) as any).message +
          ")",
        type: ToastType.Error,
        hide: false,
      });
    }
    fetchData();
    return true;
  };

  const handleDelete = async (arg: any) => {
    const response = await deleteFileOrFolder(fileName);
    if (response.status === 200) {
      setToast({
        message: "File deleted successfully",
        type: "success",
        hide: false,
      });
    } else {
      setToast({
        message:
          "File delete failed (" +
          ((await response.json()) as any).message +
          ")",
        type: ToastType.Error,
        hide: false,
      });
    }
    fetchData();
    return true;
  };

  return (
    <div className={classes.burgerMenu}>
      {isRenameModalOpen && (
        <ModalComponent
          buttonText={"Rename " + fileName}
          modalElements={{
            inputs: ["New Name"],
            textArea: [],
            filePickers: [],
          }}
          handleConfirm={handleRename}
          displayButton={false}
          alwaysOpen={true}
          onCancel={() => setIsRenameModalOpen(!isRenameModalOpen)}
        />
      )}
      {isDeleteModalOpen && (
        <ModalComponent
          buttonText={"Delete file " + fileName}
          modalElements={{
            inputs: [],
            textArea: [],
            filePickers: [],
          }}
          handleConfirm={handleDelete}
          displayButton={false}
          alwaysOpen={true}
          onCancel={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
        />
      )}
      <div className={`${isOpen}`} onClick={handleToggleMenu}>
        <BurgerMenuIcon />
      </div>
      {isOpen && (
        <div
          className={classes.menuOptions}
          style={last ? { top: "-30px" } : {}}
        >
          <div
            className={`${classes.option}`}
            onClick={() => setIsRenameModalOpen(!isRenameModalOpen)}
          >
            Rename
          </div>
          <div
            className={`${classes.option} ${classes.deleteOption}`}
            onClick={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;
