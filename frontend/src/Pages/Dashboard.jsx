import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import BackToHome from "../Components/BackToHomeDialog";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const Dashboard = (props) => {
  const [openHome, setOpenHome] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    major: "",
    level: "",
  });

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();
        if (!props.token || !props.userDetails) {
          setOpenHome(true); // Open dialog if no token is available
        }
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    // Run the async function
    fetchDataAfterTokenRefresh();

    // Empty dependency array ensures this only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!props.token) {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="Please login first"
      />
    );
  }

  if (props.loadingUser) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    ); // Show loading indicator while fetching user details
  }

  if (!props.userDetails) {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="Error fetching user details."
      />
    );
  }

  const plans = [
    { id: 1, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 2, major: "CS", level: "MS", fulfilled: false, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 3, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 4, major: "CS", level: "MS", fulfilled: false, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 5, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 6, major: "CS", level: "MS", fulfilled: false, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 7, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 8, major: "CS", level: "MS", fulfilled: false, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 9, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 10, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 11, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
    { id: 12, major: "CS", level: "MS", fulfilled: true, requirements: ["Requirement 1", "Requirement 2"] },
  ];

  const majors = ["CS", "Math", "Physics", "Biology"]; // Example majors
  const levels = ["BS", "MS", "PhD"]; // Example levels

  const handleDelete = (id) => {
    console.log(`Plan ${id} deleted`);
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    console.log("Added Plan:", formData);
    setOpenDialog(false);
    setFormData({ major: "", level: "" });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">User’s Dashboard</h1>
        <p className="dashboard-subtitle">Number of Plans: {plans.length}</p>
      </header>
      <div className="dashboard-plans">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <div className="plan-header">
              <div className="plan-header-left">
                <h2 className="plan-title">Plan No.{plan.id}</h2>
                <div
                  className="status-icon-container"
                  onMouseEnter={() => setHoveredStatus(plan.id)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  {plan.fulfilled ? (
                    <CheckBoxIcon className="status-icon success" />
                  ) : (
                    <CancelIcon className="status-icon error" />
                  )}
                  {hoveredStatus === plan.id && (
                    <div className="status-hover">
                      {plan.fulfilled
                        ? "All Requirements fulfilled"
                        : "Not fulfilled yet"}
                    </div>
                  )}
                </div>
              </div>
              <div className="plan-header-right">
                <DeleteIcon
                  className="delete-icon"
                  onClick={() => handleDelete(plan.id)}
                />
              </div>
            </div>
            <div className="plan-details">
              <p>Major: {plan.major}</p>
              <p>Level: {plan.level}</p>
            </div>
          </div>
        ))}
        <div className="plan-card add-new-plan" onClick={() => setOpenDialog(true)}>
          <div className="add-plan-frame">+</div>
        </div>
      </div>

      <Dialog fullWidth open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>Add Plan</div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddPlan}>
            <div style={{ paddingTop: "5px", paddingBottom: "15px" }}>
              <Autocomplete
                disablePortal
                options={majors}
                value={formData.major}
                onChange={(e, newValue) =>
                  setFormData((prev) => ({ ...prev, major: newValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Major" variant="outlined" required />
                )}
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "15px" }}>
              <Autocomplete
                disablePortal
                options={levels}
                value={formData.level}
                onChange={(e, newValue) =>
                  setFormData((prev) => ({ ...prev, level: newValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Level" variant="outlined" required />
                )}
              />
            </div>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;