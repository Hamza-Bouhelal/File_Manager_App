import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import Title from "./Title";
import { config } from "../utils/config";
import Toast, { ToastType } from "./utils/Toast";
import { refresh } from "../utils/req";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: theme.palette.background.paper,
    marginTop: "-100px",
  },
  formContainer: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "250px",
    width: "400px",
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "5px",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
  },
  form: {
    marginTop: theme.spacing(5),
  },
  textField: {
    margin: theme.spacing(1),
    width: "100%",
  },
  submitButton: {
    margin: theme.spacing(3, 0, 2),
    bottom: "5%",
    left: "50%",
    transform: "translateX(-50%)",
  },
}));

const LoginRegisterForm = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toastOnScreen, setToast] = useState({
    message: "",
    type: "success",
    hide: true,
  });
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
    setUsername("");
    setPassword("");
  };

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    const response = await fetch(config.backendurl + "/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.status === 201) {
      setToast({ message: data.message, type: ToastType.Success, hide: false });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("dir", "");
      resetHide();
    } else {
      setToast({ message: data.message, type: ToastType.Error, hide: false });
      resetHide();
    }
  };

  const resetHide = () => {
    const timer = setTimeout(() => {
      setToast({ message: "", type: ToastType.Success, hide: true });
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  };

  const handleLogin = async (event: any) => {
    event.preventDefault();
    const response = await fetch(config.backendurl + "/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.status === 200) {
      setToast({ message: data.message, type: ToastType.Success, hide: false });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("dir", "");
      //go to /mydrive
      window.open("/mydrive", "_self");
      resetHide();
    } else {
      setToast({ message: data.message, type: ToastType.Error, hide: false });
      resetHide();
    }
  };

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken || refreshToken == "") return;
    const fetchData = async () => {
      const refreshed = await refresh(refreshToken);
      if (refreshed) {
        window.open("/mydrive", "_self");
      } else {
        localStorage.setItem("accessToken", "");
        localStorage.setItem("refreshToken", "");
      }
    };
    fetchData();
  }, []);

  const HelperToast = () => {
    if (toastOnScreen.message !== "" && !toastOnScreen.hide) {
      return (
        <Toast
          message={toastOnScreen.message}
          type={toastOnScreen.type as ToastType}
        />
      );
    } else {
      return <div></div>;
    }
  };

  return (
    <div>
      <Title text="Safe Drive" />
      <HelperToast />
      <div className={classes.root}>
        <div className={classes.formContainer}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          <Box p={3}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6"></Typography>
                <form className={classes.form} noValidate>
                  <TextField
                    id="login-username"
                    label="Username"
                    type="text"
                    variant="outlined"
                    className={classes.textField}
                    required
                    name="username"
                    onChange={handleInputChange}
                  />
                  <TextField
                    id="login-password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    className={classes.textField}
                    required
                    name="password"
                    onChange={handleInputChange}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.submitButton}
                    onClick={handleLogin}
                  >
                    Login
                  </Button>
                </form>
              </Box>
            )}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6"></Typography>
                <form className={classes.form} noValidate>
                  <TextField
                    id="register-username"
                    label="Username"
                    type="text"
                    variant="outlined"
                    className={classes.textField}
                    required
                    name="username"
                    onChange={handleInputChange}
                  />
                  <TextField
                    id="register-password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    className={classes.textField}
                    name="password"
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.submitButton}
                    onClick={handleSignUp}
                  >
                    Register
                  </Button>
                </form>
              </Box>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterForm;
