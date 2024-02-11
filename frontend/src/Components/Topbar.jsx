import { Button } from 'react-bootstrap-buttons';
import { useState } from "react";
import { NotificationContainer, NotificationManager } from 'react-notifications';

const Topbar = ({ signedIn, openLoginPage, signIn }) => {
  return (
    <div>
      <Button
        style={{ display: signedIn ? "none" : "block" }}
        className="login_button"
        onClick={() => openLoginPage(true)}
      >
        Log In
      </Button>
      <Button
        style={{ display: signedIn ? "none" : "block" }}
        className="signUp_button"
        onClick={() => openSignUpPage(true)}
      >
        Sign Up
      </Button>
      <Button
        style={{ display: signedIn ? "block" : "none" }}
        className="login_button"
        onClick={() => {
          signIn(false);
          NotificationManager.success(
            "You Are Successfully Logged Out!",
            "Success"
          );
        }}
      >
        Log Out
      </Button>
    </div>
  );
};

export default Topbar;
