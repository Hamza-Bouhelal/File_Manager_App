import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginRegisterForm from "./components/Auth";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginRegisterForm />} />
        <Route path="about" element={<h1>About</h1>} />
        <Route path="contact" element={<h1>Contact</h1>} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </div>
  );
}

export default App;
