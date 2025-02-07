import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import BackToHome from "../Components/BackToHomeDialog";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import axios from "axios";
import { AiOutlineAccountBook } from "react-icons/ai";

const Dashboard = (props) => {
  const [openHome, setOpenHome] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    major: null,
    level: "",
    template: null,
  });

  const [planList, setPlanList] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [templateList, setTemplateList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [levelList, setLevelList] = useState([]);

  // const plans = [
  //   {
  //     id: 1,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 2,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: false,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 3,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 4,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: false,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 5,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 6,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: false,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 7,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 8,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: false,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 9,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 10,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 11,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  //   {
  //     id: 12,
  //     major: "CS",
  //     level: "MS",
  //     fulfilled: true,
  //     requirements: ["Requirement 1", "Requirement 2"],
  //   },
  // ];

  // const majors = ["CS", "Math", "Physics", "Biology"]; // Example majors
  // const levels = ["BS", "MS", "PhD"]; // Example levels

  const getListPlans = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/plan/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setPlanList(response.data);
    } catch (error) {
      console.error("Error fetching plans data", error);
    }
  };
  const getListTemplates = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/template/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setTemplateList(response.data);

      const majorResponses = await Promise.all(
        response.data.map(async (template) => {
          try {
            const majorRes = await axios.get(
              "http://localhost:8000/api/major/",
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            return majorRes.data; // This is an array
          } catch (err) {
            console.error("Error fetching major data", err);
            return []; // Return empty array instead of null
          }
        })
      );

      console.log("majorResponses (before flattening):", majorResponses);

      // **Flatten majorResponses to ensure it's a single array**
      const validMajors = majorResponses
        .flat()
        .filter((major) => major !== null);
      console.log("validMajors (flattened):", validMajors);

      if (validMajors.length > 0) {
        const uniqueMajors = Array.from(
          new Map(validMajors.map((major) => [major.id, major])).values()
        );
        setMajorList(uniqueMajors);
      }
    } catch (error) {
      console.error("Error fetching templates data", error);
    }
  };

  // ✅ Track state updates with useEffect
  useEffect(() => {
    console.log("Updated majorList:", majorList);
  }, [majorList]); // Runs when majorList updates

  const handleDelete = async (plan) => {
    await props.checkTokenAndRefresh();

    console.log(`Plan ${plan.id} deleted`);
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    console.log("Added Plan:", formData);
    setOpenDialog(false);
    setFormData({ major: "", level: "" });
  };

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();
        if (!props.token || !props.userDetails) {
          setOpenHome(true); // Open dialog if no token is available
        }
        await getListPlans();
        await getListTemplates();
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">User’s Dashboard</h1>
        <p className="dashboard-subtitle">Number of Plans: {planList.length}</p>
      </header>
      <div className="dashboard-plans">
        {planList.map((plan) => (
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
                  onClick={() => {
                    setDeleteId(plan.id);
                    setDeleteConfirmation(true);
                  }}
                />
              </div>
            </div>
            <div className="plan-details">
              <p>Major: {plan.major}</p>
              <p>Level: {plan.level}</p>
            </div>
            {deleteId === plan.id && (
              <ConfirmationDialog
                open={deleteConfirmation}
                handleClose={() => {
                  setDeleteConfirmation(false);
                  setDeleteId(null);
                }}
                message="Are you sure you want to delete this plan from the database?"
                handleSubmit={() => {
                  handleDelete(plan);
                  setDeleteId(null);
                  setDeleteConfirmation(false);
                }}
              />
            )}
          </div>
        ))}
        <div
          className="plan-card add-new-plan"
          onClick={() => setOpenDialog(true)}
        >
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
                options={majorList} // Array of major options
                getOptionLabel={(option) => option.name} // Extract major from the object
                value={
                  majorList.find((major) => major.id === formData.major) || null
                } // Handle controlled value
                // onChange={handleChangeMajor} // Handle change
                onChange={(e, newValue) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    major: newValue ? newValue.id : -1, // Update formData with the selected major or set to empty string
                  }));
                  const matchingLevels = templateList
                    .filter(
                      (template) =>
                        template.major === (newValue ? newValue.id : -1)
                    ) // Match major ID
                    .map((template) => template.level); // Extract level attribute

                  // Remove duplicates and update levelList state
                  setLevelList([...new Set(matchingLevels)]);
                }}
                sx={{ width: "100%" }} // Set width to full
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Major *"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "15px" }}>
              <Autocomplete
                disablePortal
                options={levelList}
                value={formData.level}
                onChange={(e, newValue) => {
                  // Update the selected level in formData
                  setFormData((prev) => {
                    const updatedFormData = { ...prev, level: newValue };

                    // Find the matching template in templateList based on major and level
                    const matchingTemplate = templateList.find(
                      (template) =>
                        template.major === prev.major &&
                        template.level === newValue
                    );

                    // If a matching template is found, set its id in formData.template
                    if (matchingTemplate) {
                      updatedFormData.template = matchingTemplate.id;
                    } else {
                      updatedFormData.template = null; // Reset if no matching template
                    }

                    console.log("Selected Level:", newValue);
                    console.log("Updated FormData:", updatedFormData);

                    return updatedFormData;
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Level"
                    variant="outlined"
                    required
                  />
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
