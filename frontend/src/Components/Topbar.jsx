import { Button } from "react-bootstrap-buttons";
import { useState } from "react";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";

const Topbar = ({ signedIn, openLoginPage, openSignUpPage, signIn }) => {
  return (
    <div className="top_bar">
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
          onClick={() => {
            openSignUpPage(true)
            NotificationManager.success('You have successfully made an account!', 'Success');
        }}
        >
          Sign Up
        </Button>
        <Button
          style={{ display: signedIn ? "block" : "none" }}
          className="login_button"
          onClick={() => {
            signIn(false)
            NotificationManager.success(
              "You are successfully logged out!",
              "Success"
            );
          }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
