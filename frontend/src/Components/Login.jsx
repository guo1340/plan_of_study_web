import React, { useState } from "react";
import "react-notifications/lib/notifications.css";
import { BsFillPersonFill, BsEnvelopeFill, BsLockFill } from "react-icons/bs";
import { Button } from "react-bootstrap-buttons";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";

const Login = ({ signIn, closeLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login_container">
      <div className="login_header">
        <div className="login_header">
          <div className="login_text"> Log In </div>
        </div>
        <div className="login_inputs">
          <div className="login_input">
            <img src={<BsEnvelopeFill />} alt="" />
            <input type="email" placeholder="Email" />
            <img src={<BsFillPersonFill />} alt="" />
            <input type="text" placeholder="Username" />
            <img src={<BsLockFill />} alt="" />
            <input type="password" placeholder="Password" />
          </div>
          <div className="forgot-password"> Forgot password?</div>
          <div className="submit_container">
            <Button
              className="login_submit"
              onClick={(e) => {
                signIn(true);
                closeLogin(false);
                NotificationManager.success(
                  "You Are Successfully Logged In!",
                  "Success"
                );
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
