import "./App.css";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter } from "react-router-dom";
import Topbar from "./Components/Topbar";
import Login from "./Components/Login";
import { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

const App = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [signedIn, signIn] = useState(false);
  const [signedUp, setSignUp] = useState(false)

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
        </Sidebar>
      </BrowserRouter>
      {/* <NotificationContainer /> */}
      {openLogin && <Login signIn={signIn} closeLogin={setOpenLogin} />}
    </div>
  );
};

export default App;
