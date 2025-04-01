import React, { useState } from "react";
import "react-notifications/lib/notifications.css";
import axios from "axios";
import Button from "@mui/material/Button";
import { NotificationManager } from "react-notifications";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";

const SignUp = ({ openSignUp, signIn, closeSignUp }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_pass: "",
  });

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_pass: "",
    });
    closeSignUp(false);
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_pass) {
      NotificationManager.warning("Passwords do not match", "Warning", 5000);
    } else {
      try {
        await axios.post("http://plan-of-study.cs.vt.edu/api/register/", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        NotificationManager.success("Signed Up Successfully", "Success", 5000);
      } catch (error) {
        console.log(error);
        // Extract the actual error message from the response
        if (error.response && error.response.data) {
          const errorMessages = error.response.data;

          // If multiple error messages exist, concatenate them
          let message = "";
          if (typeof errorMessages === "object") {
            message = Object.values(errorMessages).flat().join(" ");
          } else {
            message = errorMessages;
          }

          NotificationManager.error(message, "Error", 5000);
        } else {
          NotificationManager.error(
            "An unexpected error occurred.",
            "Error",
            5000
          );
        }
      }

      handleClose();
    }
  };

  return (
    <Dialog fullWidth open={openSignUp} onClose={handleClose}>
      <DialogTitle>
        <div style={{ fontSize: "35px" }}>Register</div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText style={{ paddingBottom: "10px" }}>
          Please fill out the information below to register for a new account
        </DialogContentText>
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
            <div>Email</div>
            <TextField
              required
              autoFocus
              margin="dense"
              id="email"
              label="Email"
              type="text"
              className="input_textfield"
              value={formData.email}
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
          <div className="form-input-title">
            <div>Confirm Password</div>
            <TextField
              required
              autoFocus
              margin="dense"
              id="confirm_pass"
              label="Confirm Password"
              type="password"
              className="input_textfield"
              value={formData.confirm_pass}
              onChange={handleChange}
              fullWidth
            />
          </div>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignUp;
