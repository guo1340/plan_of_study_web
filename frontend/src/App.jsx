import "./App.css";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Pages/Home";
import SignUp from "./Components/SignUp";
import { useState, useEffect } from "react";
import { NotificationContainer } from "react-notifications";
// import "bootstrap/dist/css/bootstrap.min.css";
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
import { NotificationManager } from "react-notifications";

const App = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignUp, setSignUp] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Retrieve the token from localStorage when the app mounts
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken); // Save the token to state
    }
  }, []);

  const handleSignIn = (isSignedIn) => {
    if (isSignedIn) {
      const storedToken = localStorage.getItem("authToken");
      setToken(storedToken); // Update token in state after login
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear the token from localStorage
    setToken(null); // Clear the token from state
    NotificationManager.success("Log out Successfull", "Success", 5000);
  };

  return (
    <div>
      <BrowserRouter>
        <Sidebar
          setOpenLogin={setOpenLogin}
          setSignUp={setSignUp}
          handleLogout={handleLogout}
        >
          <Routes>
            <Route path="/" element={<Home token={token} />} />
            <Route path="/home" element={<Home token={token} />} />
            <Route path="/courses" element={<Courses token={token} />} />
            <Route path="/tests" element={<Tests token={token} />} />
            <Route path="/dashboard" element={<Dashboard token={token} />} />
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
            signIn={handleSignIn}
            closeLogin={setOpenLogin}
          />
        )}
        <SignUp
          openSignUp={openSignUp}
          signIn={handleSignIn}
          closeSignUp={setSignUp}
        />
      </BrowserRouter>
      <NotificationContainer />
    </div>
  );
};

export default App;
