import { useState, useEffect } from "react";
import "./Toast.css"; // you can define your own CSS styles

export enum ToastType {
  Success = "success",
  Error = "error",
}
interface ToastProps {
  type: ToastType;
  message: string;
}

const Toast = ({ message, type }: ToastProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getClassName = () => {
    switch (type) {
      case "success":
        return "toast success";
      case "error":
        return "toast error";
      default:
        return "toast";
    }
  };

  return (
    <div className={show ? getClassName() + " show" : getClassName()}>
      {message}
    </div>
  );
};

export default Toast;
