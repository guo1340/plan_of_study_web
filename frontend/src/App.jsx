import "./App.css";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Pages/Home";
import SignUp from "./Components/SignUp";
import { useState } from "react";
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

const App = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [signedIn, signIn] = useState(false);
  const [openSignUp, setSignUp] = useState(false);

  return (
    <div>
      <BrowserRouter>
        <Sidebar setOpenLogin={setOpenLogin} setSignUp={setSignUp}>
          <Routes>
            <Route path="/" element={<Home signedIn={signedIn} />} />
            <Route path="/home" element={<Home signedIn={signedIn} />} />
            <Route path="/courses" element={<Courses signedIn={signedIn} />} />
            <Route path="/tests" element={<Tests signedIn={signedIn} />} />
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
      </BrowserRouter>
      <NotificationContainer />
      {openLogin && (
        <Login
          openLogin={openLogin}
          signIn={signIn}
          closeLogin={setOpenLogin}
        />
      )}
      <SignUp openSignUp={openSignUp} signIn={signIn} closeSignUp={setSignUp} />
    </div>
  );
};

export default App;
