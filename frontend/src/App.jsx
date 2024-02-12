import "./App.css";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Topbar from "./Components/Topbar";
import { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

const App = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [signedIn, signIn] = useState(false);

  return (
    <div>
      <BrowserRouter>
        <Sidebar>
          <Topbar
            signedIn={signedIn}
            openLoginPage={setOpenLogin}
            signIn={signIn}
          />
        </Sidebar>
      </BrowserRouter>
      {/* <NotificationContainer /> */}
    </div>
  );
};

export default App;
