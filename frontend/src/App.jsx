import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Home from "./pages/Home";
import About from "./pages/About";
import RecieptLogger from "./pages/RecieptLogger";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Analyze from "./pages/Analyze";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/reciepts" element={<RecieptLogger />} />
          <Route path="/analyze" element={<Analyze />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
