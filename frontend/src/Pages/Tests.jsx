import React from "react";
import { NavLink } from "react-router-dom";

const Tests = () => {
  const links = [
    { path: "/tests/elective-fields", name: "Elective Fields" },
    { path: "/tests/courses", name: "Classes" },
    { path: "/tests/semesters", name: "Semesters" },
    { path: "/tests/templates", name: "Templates" },
    { path: "/tests/plans", name: "Plans" },
    { path: "/tests/users", name: "Users" },
  ];
  return (
    <div>
      {links.map((item, index) => (
        <NavLink to={item.path} key={index}>
          <div>{item.name}</div>
        </NavLink>
      ))}
    </div>
  );
};

export default Tests;
