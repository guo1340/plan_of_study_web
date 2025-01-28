import { IoMdClose } from "react-icons/io";
import {
  AiOutlineMenu,
  AiOutlineLogin,
  AiOutlineLogout,
  AiOutlineSolution,
  AiFillTool,
} from "react-icons/ai";
import {
  BsHouseDoor,
  BsMap,
  BsBook,
  BsQuestionCircle,
  BsSearch,
} from "react-icons/bs";
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
// import default_profile_pic from "../Assets/profile_pic.jpg";
// import { Button } from "@mui/material";

const Sidebar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Update isAdmin based on props
    // console.log("hello");
    // console.log(props.userDetails);
    setIsAdmin(props.loggedIn && props.userDetails?.role === "admin");
  }, [props.loggedIn, props.userDetails]);

  const barItem = [
    {
      path: "/",
      name: "Home",
      icon: <BsHouseDoor />,
      needAuth: false,
      needAdmin: false,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <BsMap />,
      needAuth: true,
      needAdmin: false,
    },
    {
      path: "/courses",
      name: "Courses",
      icon: <BsBook />,
      needAuth: false,
      needAdmin: false,
    },
    {
      path: "/demos",
      name: "Demos",
      icon: <BsSearch />,
      needAuth: true,
      needAdmin: false,
    },
    {
      path: "/FAQ",
      name: "FAQ",
      icon: <BsQuestionCircle />,
      needAuth: false,
      needAdmin: false,
    },
    {
      path: "/admin",
      name: "Admin",
      icon: <AiFillTool />,
      needAuth: true,
      needAdmin: true,
    },
  ];

  return (
    <div className="main_container">
      <div
        className="sidebar_container"
        style={{ width: isOpen ? "200px" : "100px" }}
      >
        {!props.loggedIn ? (
          <>
            <Tooltip title={isOpen ? "" : "Log In"} placement="right">
              <NavLink
                className="link"
                onClick={() => props.setOpenLogin(true)}
              >
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
              <NavLink className="link" onClick={() => props.setSignUp(true)}>
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
            <NavLink to={"/home"} className="link" onClick={props.handleLogout}>
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
            (!item.needAuth || props.loggedIn) &&
            (!item.needAdmin || isAdmin) && (
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
      <main
        className="body_container"
        style={{
          width: isOpen ? "calc(100% - 200px)" : "calc(100% - 100px)",
          transition: "0.5s",
        }}
      >
        {props.children}
      </main>
    </div>
  );
};

export default Sidebar;
