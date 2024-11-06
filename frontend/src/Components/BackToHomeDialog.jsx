import React from "react";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";

const BackToHome = (props) => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleClose = () => {
    props.setOpenDialog(false);
    navigate("/home");
  };
  return (
    <Dialog fullWidth open={props.openDialog} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">An Issue Has Occured</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Tooltip title={"Returning you back to the home page"} placement="left">
          <Button
            variant="contained"
            onClick={handleClose}
            autoFocus
            sx={{ background: "orange" }}
          >
            OK
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default BackToHome;
