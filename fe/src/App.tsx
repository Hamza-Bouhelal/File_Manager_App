import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginRegisterForm from "./components/Auth";
import Directory from "./components/Drive";
import React, { useState } from "react";
import Toast, { ToastType } from "./components/utils/Toast";
export let setToast: any;
function App() {
  const arr = useState({
    message: "",
    type: "success",
    hide: true,
  });
  const toastOnScreen = arr[0];
  setToast = arr[1];

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
      <HelperToast />
      <Routes>
        <Route path="/" element={<LoginRegisterForm />} />
        <Route path="mydrive" element={<Directory />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </div>
  );
}

export default App;
