import axios from "axios";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";

const MajorSearchBar = (props) => {
  const [searchFormData, setSearchFormData] = useState({
    name: "",
    abbreviation: "",
  });

  const [majors, setMajors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on submit
    try {
      const searchQuery = JSON.stringify(searchFormData);
      const response = await axios.get(
        `http://plan-of-study.cs.vt.edu/api/major/?search=${encodeURIComponent(
          searchQuery
        )}`
      );
      props.setMajors(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getListMajors = async () => {
    try {
      const majorRes = await axios.get(
        "http://plan-of-study.cs.vt.edu/api/major"
      );
      setMajors(majorRes.data);
    } catch (error) {
      console.error("Error fetching majors:", error);
    }
  };

  const handleChange = (e, newValue, fieldName) => {
    setSearchFormData((prevData) => ({
      ...prevData,
      [fieldName]: newValue ? newValue[fieldName] : "", // Update the relevant field
    }));
  };

  const handleClear = () => {
    setSearchFormData({
      name: "",
      abbreviation: "",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Inline checkTokenAndRefresh logic
        const token = localStorage.getItem("accessToken");
        if (!token) {
          // Logic for refreshing the token
        }
        await getListMajors();
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchData();
  }, []); // No unnecessary dependencies

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-bar-container">
        <Autocomplete
          className="search-bar-contents"
          options={majors} // Array of major options
          getOptionLabel={(option) => option.name || ""} // Extract major from the object
          value={
            majors.find((major) => major.name === searchFormData.name) || null
          }
          onChange={(event, newValue) => {
            handleChange(event, newValue, "name");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Major Name"
              name="name"
              variant="outlined"
              onChange={getListMajors}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={majors} // Array of major options
          getOptionLabel={(option) => option.abbreviation || ""} // Extract major from the object
          value={
            majors.find(
              (major) => major.abbreviation === searchFormData.abbreviation
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange(event, newValue, "abbreviation");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Abbreviation"
              name="abbreviation"
              variant="outlined"
              onChange={getListMajors}
            />
          )}
        />
        <div className="search-bar-contents search-buttons-container">
          <Button type="submit" color="primary" className="search-bar-contents">
            Search
          </Button>
          <Button
            type="submit"
            color="secondary"
            className="search-bar-contents"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MajorSearchBar;
