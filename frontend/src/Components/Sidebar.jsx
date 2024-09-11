import { IoMdClose } from "react-icons/io";
import {
  AiOutlineMenu,
  AiOutlineLogin,
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
import default_profile_pic from "../Assets/profile_pic.jpg";
import { Button } from "@mui/material";

const Sidebar = ({ children, setOpenLogin, setSignUp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const barItem = [
    {
      path: "/",
      name: "Home",
      icon: <BsHouseDoor />,
    },

    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <BsMap />,
    },

    {
      path: "/courses",
      name: "Courses",
      icon: <BsBook />,
    },

    {
      path: "/demos",
      name: "Demos",
      icon: <BsSearch />,
    },

    {
      path: "/tests",
      name: "FAQ",
      icon: <BsQuestionCircle />,
    },
  ];

  return (
    <div className="main_container">
      <div
        className="sidebar_container"
        style={{ width: isOpen ? "300px" : "100px" }}
      >
        {/* <div className="profile_head">
          <img
            id="profile_img"
            src={default_profile_pic}
            alt="Default profile"
          />
          <div
            className="profile_info"
            style={{ display: isOpen ? "block" : "none" }}
          >
            <div className="profile_username">Username</div>
            <div className="profile_email">Email@email.com</div>
          </div>
        </div> */}
        <Tooltip title={isOpen ? "" : "Log In"} placement="right">
          <NavLink key={0} className="link" onClick={() => setOpenLogin(true)}>
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
          <NavLink key={1} className="link" onClick={() => setSignUp(true)}>
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
        <div className="divider"></div>
        {/* <div className="sidebarStyle"> */}
        {barItem.map((item, index) => (
          <Tooltip title={isOpen ? "" : item.name} placement="right">
            <NavLink
              to={item.path}
              key={index}
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
        ))}
        <div className="toggle_container">
          <div className="extention_toggle" onClick={toggle}>
            {" "}
            <div> {isOpen ? <IoMdClose /> : <AiOutlineMenu />} </div>
          </div>
        </div>
        {/* </div> */}
      </div>
      <main className="body_container">{children}</main>
    </div>
  );
};

export default Sidebar;
