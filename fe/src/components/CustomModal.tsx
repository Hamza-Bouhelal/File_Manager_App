import React, { useState } from "react";
import { Button, Modal, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    borderRadius: 10,
    color: "#000",
    backgroundColor: "#fff",
    border: "2px solid #e0e0e0",
    fontSize: 14,
    fontWeight: 400,
    padding: "5px 10px",
    marginLeft: "10px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: "#fff",
    border: "2px solid #000",
    borderRadius: 10,
    padding: theme.spacing(2, 4, 3),
    display: "flex",
    flexDirection: "column",
    width: "50vw",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
    paddingLeft: "50px",
  },
  left: {
    left: 0,
  },
  filePicker: {
    display: "flex",
    alignItems: "center",
    margin: "8px 0",
  },
  filePickerLabel: {
    marginRight: "8px",
  },
  filePickerInput: {
    marginRight: "8px",
  },
  textArea: {
    margin: "8px 0",
    resize: "none",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 500,
    marginBottom: "1rem",
  },
}));

interface ModalProps {
  buttonText: string;
  modalElements: {
    inputs: string[];
    filePickers?: { fileType: string; label: string }[];
    textArea?: string[];
  };
  handleConfirm: (args: {
    inputs: string[];
    textArea: string[];
    filePickers: FormData[];
  }) => Promise<boolean>;
  displayButton?: boolean;
  alwaysOpen?: boolean;
  onCancel?: () => void;
  filePickerMultiple?: boolean;
}

const ModalComponent = ({
  buttonText,
  modalElements,
  handleConfirm,
  displayButton = true,
  alwaysOpen = false,
  filePickerMultiple = false,
  onCancel = () => {},
}: ModalProps) => {
  const [open, setOpen] = useState(alwaysOpen);
  const defaultValue = {
    inputs: modalElements.inputs.map(() => "") || [],
    textArea: (modalElements as any).textArea.map(() => "") || [],
    filePickers:
      (modalElements as any).filePickers.map(() => new FormData()) || [],
  };
  const [values, setValues] = useState<{
    inputs: string[];
    textArea: string[];
    filePickers: FormData[];
  }>(defaultValue);
  const classes = useStyles();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (!alwaysOpen) setOpen(false);
    onCancel();
  };

  const handleInputChange = (about: "textArea" | "inputs") => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target as any;
      setValues((prevValues) => {
        const newValues = { ...prevValues };
        newValues[about][Number(name)] = value;
        return newValues;
      });
    };
  };

  const handleConfirmClick = async () => {
    const confirmed = await handleConfirm(values);
    if (confirmed) {
      setOpen(false);
      setValues(defaultValue);
    }
  };

  const renderInputs = () =>
    modalElements.inputs &&
    modalElements.inputs.map((label, index) => (
      <TextField
        key={index}
        label={label}
        variant="outlined"
        name={index.toString()}
        onChange={handleInputChange("inputs")}
      />
    ));

  const filePickerOnChange = (index: number) => {
    return (event: any) => {
      const files = event.target.files as FileList;
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("file", files[i]);
      }
      setValues((prevValues) => {
        const newValues = { ...prevValues };
        newValues.filePickers[index] = data;
        return newValues;
      });
    };
  };

  const renderFilePickers = () =>
    modalElements.filePickers &&
    modalElements.filePickers.map(({ fileType, label }, index) => (
      <div key={index}>
        <label
          className={classes.filePickerLabel}
          htmlFor={`filePicker${index}`}
        >
          {label}
        </label>
        {filePickerMultiple ? (
          <input
            id={`filePicker${index}`}
            type="file"
            accept={fileType}
            className={classes.filePicker}
            onChange={filePickerOnChange(index)}
            multiple
          />
        ) : (
          <input
            id={`filePicker${index}`}
            type="file"
            accept={fileType}
            className={classes.filePicker}
            onChange={filePickerOnChange(index)}
          />
        )}
      </div>
    ));

  const renderTextAreas = () =>
    modalElements.textArea &&
    modalElements.textArea.map((label, index) => (
      <TextField
        key={index}
        className={classes.textArea}
        label={label}
        variant="outlined"
        multiline
        rows={4}
        name={index.toString()}
        onChange={handleInputChange("textArea")}
      />
    ));

  return (
    <>
      {displayButton && (
        <Button className={classes.button} onClick={handleOpen}>
          {buttonText}
        </Button>
      )}
      <Modal className={classes.modal} open={open} onClose={handleClose}>
        <div className={classes.paper}>
          <div className={classes.title}>
            <h2>{buttonText}</h2>
          </div>
          {renderInputs()}
          {renderFilePickers()}
          {renderTextAreas()}
          <div className={classes.buttonGroup}>
            <Button
              className={classes.button + " " + classes.left}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button className={classes.button} onClick={handleConfirmClick}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ModalComponent;
