import { makeStyles } from "@material-ui/core/styles";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  header: {
    position: "fixed",
    top: 0,
    width: "100%",
    backgroundColor: "#e9edef",
    color: "#2d2d2d",
    textAlign: "center",
    paddingTop: "2rem",
    paddingBottom: "2rem",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    animation: "$slideDown 0.5s",
    height: "80px",
    marginTop: "-40px",
    zIndex: 99,
  },
  "@keyframes slideDown": {
    "0%": {
      transform: "translateY(-100%)",
      opacity: 0,
    },
    "100%": {
      transform: "translateY(0)",
      opacity: 1,
    },
  },
}));

const Title = ({ text }: any) => {
  const classes = useStyles();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={classes.header}
      style={{ display: isVisible ? "block" : "none" }}
    >
      <h1 style={{ fontSize: "3rem", fontFamily: "Roboto" }}>{text}</h1>
    </div>
  );
};

export default Title;
