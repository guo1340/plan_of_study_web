import { IoMdClose } from "react-icons/io";
import {
  AiOutlineMenu,
  AiOutlineLogin,
  AiOutlineLogout,
  AiOutlineSolution,
} from "react-icons/ai";
import {
  BsHouseDoor,
  BsMap,
  BsBook,
  BsQuestionCircle,
  BsSearch,
} from "react-icons/bs";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
// import default_profile_pic from "../Assets/profile_pic.jpg";
// import { Button } from "@mui/material";

const Sidebar = ({
  children,
  setOpenLogin,
  setSignUp,
  handleLogout,
  loggedIn,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const barItem = [
    { path: "/", name: "Home", icon: <BsHouseDoor />, needAuth: false },
    { path: "/dashboard", name: "Dashboard", icon: <BsMap />, needAuth: true },
    { path: "/courses", name: "Courses", icon: <BsBook />, needAuth: false },
    { path: "/demos", name: "Demos", icon: <BsSearch />, needAuth: true },
    {
      path: "/tests",
      name: "FAQ",
      icon: <BsQuestionCircle />,
      needAuth: false,
    },
  ];

  return (
    <div className="main_container">
      <div
        className="sidebar_container"
        style={{ width: isOpen ? "300px" : "100px" }}
      >
        {!loggedIn ? (
          <>
            <Tooltip title={isOpen ? "" : "Log In"} placement="right">
              <NavLink className="link" onClick={() => setOpenLogin(true)}>
                <div className="icon">
                  <AiOutlineLogin />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Log In
                </div>
              </NavLink>
            </Tooltip>
            <Tooltip title={isOpen ? "" : "Register"} placement="right">
              <NavLink className="link" onClick={() => setSignUp(true)}>
                <div className="icon">
                  <AiOutlineSolution />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Register
                </div>
              </NavLink>
            </Tooltip>
          </>
        ) : (
          <Tooltip title={isOpen ? "" : "Log Out"} placement="right">
            <NavLink to={"/home"} className="link" onClick={handleLogout}>
              <div className="icon">
                <AiOutlineLogout />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                Log Out
              </div>
            </NavLink>
          </Tooltip>
        )}
        <div className="divider"></div>
        {barItem.map(
          (item, index) =>
            (!item.needAuth || loggedIn) && (
              <Tooltip
                title={isOpen ? "" : item.name}
                placement="right"
                key={index}
              >
                <NavLink
                  to={item.path}
                  className="link"
                  activeclassname="active"
                >
                  <div className="icon">{item.icon}</div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    {item.name}
                  </div>
                </NavLink>
              </Tooltip>
            )
        )}
        <div className="toggle_container">
          <div className="extention_toggle" onClick={toggle}>
            {isOpen ? <IoMdClose /> : <AiOutlineMenu />}
          </div>
        </div>
      </div>
      <main className="body_container">{children}</main>
    </div>
  );
};

export default Sidebar;
