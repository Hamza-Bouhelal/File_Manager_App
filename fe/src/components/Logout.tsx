import { config } from "../utils/config";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    position: "fixed",
    top: theme.spacing(2),
    right: theme.spacing(2),
    width: 70,
    height: 70,
    borderRadius: "50%",
    backgroundColor: "#f5f5f5",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      backgroundColor: "#e0e0e0",
      transform: "scale(1.1)",
    },
    cursor: "pointer",
    zIndex: 99,
  },
  buttonText: {
    color: "#333",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    transition: "color 0.2s ease-out",
    "&:hover": {
      color: "#666",
    },
  },
}));

export const Logout = () => {
  const classes = useStyles();

  const logout = async () => {
    const response = await fetch(config.backendurl + "/users/logout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: localStorage.getItem("refreshToken") }),
    });
    if (response.status === 200) {
      localStorage.setItem("accessToken", "");
      localStorage.setItem("refreshToken", "");
      window.open("/", "_self");
    }
  };

  return (
    <button className={classes.button} onClick={logout}>
      <span className={classes.buttonText}>Logout</span>
    </button>
  );
};
