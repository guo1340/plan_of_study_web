import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import BackToHome from "../Components/BackToHomeDialog";

const Admin = (props) => {
  const links = [
    { path: "/admin/elective-fields", name: "Elective Fields" },
    { path: "/admin/semesters", name: "Semesters" },
    { path: "/admin/templates", name: "Templates" },
    { path: "/admin/plans", name: "Plans" },
    { path: "/admin/users", name: "Users" },
    { path: "/admin/major", name: "Major" },
    { path: "/admin/credit-type", name: "Credit Type" },
  ];

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();
        if (!props.token || localStorage.getItem("UserRole") !== "admin") {
          setOpenDialog(true); // Open dialog if no token is available
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
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        message="Please login first"
      />
    );
  }

  if (localStorage.getItem("userRole") !== "admin") {
    return (
      <BackToHome
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        message="You must be an Admin user to access this page ~"
      />
    );
  }

  return (
    <div>
      {localStorage.getItem("userRole") === "admin" &&
        links.map((item, index) => (
          <NavLink to={item.path} key={index}>
            <div>{item.name}</div>
          </NavLink>
        ))}
    </div>
  );
};

export default Admin;
