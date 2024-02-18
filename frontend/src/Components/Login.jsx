import React, { useState } from "react";
import "react-notifications/lib/notifications.css";
import { BsFillPersonFill, BsEnvelopeFill, BsLockFill } from "react-icons/bs";
import { Button } from "react-bootstrap-buttons";
import { NotificationManager,
} from "react-notifications";
import Modal from 'react-bootstrap/Modal';

const Login = ({ signIn, closeLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")

  return (
    <div className="login_background">
        <Button onClick={() => closeLogin(false)}> 
            X
        </Button>
      <div className="login_container">
        <div className="login_header">
          <div className="login_text"> Log In </div>
        </div>
        <div className="login_inputs">
          <div className="login_input">
            <img src={<BsEnvelopeFill />} alt="" />
            <input type="email" placeholder="Email" onChange={(e) => setPassword(e.target.value)} email="email" id="email" name="email"/>
            <img src={<BsFillPersonFill />} alt="" />
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} username="username" id="username" name="username"/>
            <img src={<BsLockFill />} alt="" />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} password="password" id="password" name="password"/>
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
