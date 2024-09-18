import React, { useState } from "react";
import { BsFillPersonFill, BsEnvelopeFill, BsLockFill } from "react-icons/bs";
import Button from "@mui/material/Button";
import { NotificationManager } from "react-notifications";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
const Login = ({ openLogin, signIn, closeLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleClose = () => {
    setFormData({
      username: "",
      password: "",
    });
    closeLogin(false);
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        username: formData.username,
        password: formData.password,
      });
      if (response.status === 200 && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        signIn(true);
        closeLogin(false);
        NotificationManager.success("Login Successfull", "Success", 5000);
      }
      // const response = await fetch("http://localhost:8000/api/token/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ email, password }),
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   localStorage.setItem("token", data.access);
      //   signIn(true);
      //   closeLogin(false);
      //   NotificationManager.success(
      //     "You Are Successfully Logged In!",
      //     "Success"
      //   );
      // } else {
      //   NotificationManager.error("Invalid credentials", "Error");
      // }
    } catch (error) {
      console.log(error);
      NotificationManager.error("Login Failed", "Error", 5000);
    }
  };

  return (
    <Dialog fullWidth open={openLogin} onClose={handleClose}>
      <DialogTitle>
        <div style={{ fontSize: "35px" }}>Log In</div>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <div className="form-input-title">
            <div>Username</div>
            <TextField
              required
              autoFocus
              margin="dense"
              id="username"
              label="Username"
              type="text"
              className="input_textfield"
              value={formData.username}
              onChange={handleChange}
              fullWidth
            />
          </div>
          <div className="form-input-title">
            <div>Password</div>
            <TextField
              required
              autoFocus
              margin="dense"
              id="password"
              label="Password"
              type="password"
              className="input_textfield"
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />
          </div>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" color="primary">
              Login
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
