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
    height: "100px",
    zIndex: 99,
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
      <h1
        style={{ fontSize: "3rem", fontFamily: "Roboto", marginTop: "-20px" }}
      >
        {text}
      </h1>
    </div>
  );
};

export default Title;
