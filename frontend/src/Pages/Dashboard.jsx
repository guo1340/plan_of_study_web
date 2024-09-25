import React from "react";

const Dashboard = ({ token, userDetails, loadingUser }) => {
  if (!token) {
    return <div>Please login first</div>; // Show this if there's no token
  }

  if (loadingUser) {
    return <div>Loading...</div>; // Show loading indicator while fetching user details
  }

  if (!userDetails) {
    return <div>Error fetching user details.</div>; // Show error if userDetails is null
  }

  return (
    <div className="home_container">
      <header>
        <h1 className="dashboard_title">
          {userDetails.user.username}'s Dashboard
        </h1>
        <p className="home_description">
          total number of plans: {userDetails.plans.length}
        </p>
      </header>
    </div>
  );
};

export default Dashboard;
