import "./App.css";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import Topbar from "./Components/Topbar";
import Login from "./Components/Login";
import Home from "./Pages/Home";
import SignUp from "./Components/SignUp";
import { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

const App = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [signedIn, signIn] = useState(false);
  const [openSignUp, setSignUp] = useState(false);

  return (
    <div>
      <BrowserRouter>
        <Sidebar>
          <Topbar
            signedIn={signedIn}
            openLoginPage={setOpenLogin}
            signIn={signIn}
            openSignUpPage={setSignUp}
          />
          <Routes>
            <Route path="/" element={<Home signedIn={signedIn} />} />
            <Route path="/home" element={<Home signedIn={signedIn}/>} />
          </Routes>
        </Sidebar>
      </BrowserRouter>
      {/* <NotificationContainer /> */}
      {openLogin && <Login signIn={signIn} closeLogin={setOpenLogin} />}
      {openSignUp && <SignUp signIn={signIn} closeSignUp={setSignUp} />}
    </div>
  );
};

export default App;
