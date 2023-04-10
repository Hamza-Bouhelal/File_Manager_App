import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginRegisterForm from "./components/Auth";
import Directory from "./components/Drive";
import CustomModal from "./components/CustomModal";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginRegisterForm />} />
        <Route path="mydrive" element={<Directory />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </div>
  );
}

export default App;
