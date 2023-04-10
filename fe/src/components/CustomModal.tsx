import React, { useState } from "react";
import { Button, Modal, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    borderRadius: 20,
    color: "#000",
    backgroundColor: "#fff",
    fontSize: 16,
    fontWeight: 600,
    padding: "10px 25px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#000",
      color: "#fff",
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
    maxWidth: 400,
  },
  input: {
    margin: theme.spacing(1),
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
  },
  cancelButton: {
    color: "#000",
    border: "2px solid #000",
    marginLeft: theme.spacing(1),
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
}

const ModalComponent = ({
  buttonText,
  modalElements,
  handleConfirm,
}: ModalProps) => {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
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
        className={classes.input}
        label={label}
        variant="outlined"
        name={index.toString()}
        onChange={handleInputChange("inputs")}
      />
    ));

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
        <input
          id={`filePicker${index}`}
          type="file"
          accept={fileType}
          className={classes.filePicker}
          onChange={(event) => {
            const files = event.target.files as FileList;
            const data = new FormData();
            for (let i = 0; i < files.length; i++) {
              data.append(i.toString(), files[i]);
            }
            setValues((prevValues) => {
              const newValues = { ...prevValues };
              newValues.filePickers[index] = data;
              return newValues;
            });
          }}
        />
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
      <Button className={classes.button} onClick={handleOpen}>
        {buttonText}
      </Button>
      <Modal className={classes.modal} open={open} onClose={handleClose}>
        <div className={classes.paper}>
          {renderInputs()}
          {renderFilePickers()}
          {renderTextAreas()}
          <div className={classes.buttonGroup}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmClick}
            >
              Confirm
            </Button>
            <Button variant="contained" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ModalComponent;
