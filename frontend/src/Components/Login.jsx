import React, { useState } from "react";
import Button from "@mui/material/Button";
import { NotificationManager } from "react-notifications";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = ({ openLogin, closeLogin, login }) => {
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

  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        username: formData.username,
        password: formData.password,
      });
      if (response.status === 200) {
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);

        // Optionally, store the access token expiration time (assuming it's a JWT token)
        const decodedToken = parseJwt(response.data.access);
        localStorage.setItem("accessTokenExpiration", decodedToken.exp * 1000);

        NotificationManager.success("Login Successful", "Success", 5000);
        closeLogin(false);
        login(true);
        navigate("/dashboard");
      } else {
        NotificationManager.warning(
          "The combination of entered username and password does not exist",
          "Warning",
          5000
        );
      }
    } catch (error) {
      console.error("Error during login:", error);
      NotificationManager.error("Login Failed", "Error", 5000);
    }
  };

  // Helper function to decode JWT token (JWT structure is "header.payload.signature")
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

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
