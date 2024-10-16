import "./App.css";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Pages/Home";
import SignUp from "./Components/SignUp";
import { useState, useEffect } from "react";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import React from "react";
import Courses from "./Pages/Courses";
import Tests from "./Pages/Tests";
import ElectiveFieldTest from "./Pages/Tests/ElectiveField";
import CourseTest from "./Pages/Tests/Courses";
import SemesterTest from "./Pages/Tests/Semesters";
import TemplateTest from "./Pages/Tests/Templates";
import PlansTest from "./Pages/Tests/Plans";
import UsersTest from "./Pages/Tests/Users";
import Dashboard from "./Pages/Dashboard";
import axios from "axios";

const App = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignUp, setSignUp] = useState(false);
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );
  const [userDetails, setUserDetails] = useState(null); // Store user details here
  const [loadingUser, setLoadingUser] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiration");
    setLoggedIn(false);
    setUserDetails(null); // Clear user details on logout
    NotificationManager.success("Logged out successfully", "Success", 5000);
  };

  useEffect(() => {
    checkTokenAndRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkTokenAndRefresh = async () => {
    const accessTokenExpiration = localStorage.getItem("accessTokenExpiration");
    if (accessTokenExpiration && Date.now() > accessTokenExpiration) {
      await refreshAccessToken(); // Refresh the token if it's expired
    } else if (localStorage.getItem("accessToken")) {
      fetchUser(); // Fetch user details if token is still valid
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      const response = await axios.post(
        "http://localhost:8000/api/token/refresh/",
        { refresh: refreshToken }
      );

      if (response.status === 200) {
        const { access } = response.data;
        localStorage.setItem("accessToken", access);

        const decodedToken = parseJwt(access);
        localStorage.setItem("accessTokenExpiration", decodedToken.exp * 1000);

        setLoggedIn(true);
        fetchUser(); // Fetch user details after the token is refreshed
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error during token refresh:", error);
      handleLogout(); // Logout if refresh token fails
    }
  };

  const fetchUser = async () => {
    setLoadingUser(true); // Start loading user details
    try {
      const response = await axios.get("http://localhost:8000/api/user/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.status === 200) {
        setUserDetails(response.data[0]); // Set user details in state
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      handleLogout(); // Handle error by logging out or showing a notification
    } finally {
      setLoadingUser(false); // Stop loading user details
    }
  };

  // Helper function to decode JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  return (
    <div>
      <BrowserRouter>
        <Sidebar
          setOpenLogin={setOpenLogin}
          setSignUp={setSignUp}
          handleLogout={handleLogout}
          loggedIn={loggedIn}
        >
          <Routes>
            <Route
              path="/"
              element={<Home token={localStorage.getItem("accessToken")} />}
            />
            <Route
              path="/home"
              element={<Home token={localStorage.getItem("accessToken")} />}
            />
            <Route
              path="/courses"
              element={
                <Courses
                  token={localStorage.getItem("accessToken")}
                  checkTokenAndRefresh={checkTokenAndRefresh}
                />
              }
            />
            <Route
              path="/tests"
              element={<Tests token={localStorage.getItem("accessToken")} />}
            />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  token={localStorage.getItem("accessToken")}
                  userDetails={userDetails} // Pass user details to Dashboard
                  loadingUser={loadingUser} // Pass loading state to Dashboard
                />
              }
            />
            <Route
              path="/tests/elective-fields"
              element={<ElectiveFieldTest />}
            />
            <Route path="/tests/courses" element={<CourseTest />} />
            <Route path="/tests/semesters" element={<SemesterTest />} />
            <Route path="/tests/templates" element={<TemplateTest />} />
            <Route path="/tests/plans" element={<PlansTest />} />
            <Route path="/tests/users" element={<UsersTest />} />
          </Routes>
        </Sidebar>
        {openLogin && (
          <Login
            openLogin={openLogin}
            closeLogin={setOpenLogin}
            login={setLoggedIn}
          />
        )}
        <SignUp openSignUp={openSignUp} closeSignUp={setSignUp} />
      </BrowserRouter>
      <NotificationContainer />
    </div>
  );
};

export default App;
