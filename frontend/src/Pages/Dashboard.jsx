import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import BackToHome from "../Components/BackToHomeDialog";

const Dashboard = (props) => {
  const [openHome, setOpenHome] = useState(false);

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

  return (
    <div className="home_container">
      <header>
        <h1 className="dashboard_title">
          {props.userDetails.user.username}'s Dashboard
        </h1>
        <p className="home_description">
          total number of plans: {props.userDetails.plans.length}
        </p>
      </header>
    </div>
  );
};

export default Dashboard;
