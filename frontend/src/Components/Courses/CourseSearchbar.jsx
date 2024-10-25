import axios from "axios";
import React, { useState, useEffect } from "react";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";

function CourseSearchBar({ props }) {
  // Function to handle input changes

  const [searchFormData, setSearchFormData] = useState({
    major: "",
    abbreviation: "",
    title: "",
    description: "",
    credits: null,
    editable_credits: null,
    elective_field_id: null,
    prereq_id: [],
    seasons: [],
    coreq_id: [],
  });

  const handleSubmit = async (e) => {
    await axios.get(`http://localhost:8000/api/classes/`, {
      params: searchFormData,
    });
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}></form>
    </div>
  );
}

export default CourseSearchBar;
