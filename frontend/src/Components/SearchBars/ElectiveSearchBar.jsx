import axios from "axios";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";

const ElectiveSearchBar = (props) => {
  const [searchFormData, setSearchFormData] = useState({
    major: null,
    field_name: "",
  });

  const [majors, setMajors] = useState([]);
  const [elective_fields, setFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on submit
    try {
      const searchQuery = JSON.stringify(searchFormData);
      const response = await axios.get(
        `http://plan-of-study.cs.vt.edu/api/elective-field/?search=${encodeURIComponent(
          searchQuery
        )}`
      );
      props.setFields(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getListMajors = () => {
    axios
      .get("http://plan-of-study.cs.vt.edu/api/major/")
      .then((res) => {
        setMajors(res.data);
      })
      .catch((error) => {
        console.error("Error fetching major data:", error);
      });
  };

  const getListFields = async () => {
    try {
      const res = await axios.get(
        "http://plan-of-study.cs.vt.edu/api/elective-field/"
      );
      setFields(res.data);
    } catch (error) {
      console.error("Error fetching elective fields data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await props.checkTokenAndRefresh();
        await getListFields();
        await getListMajors(); // Getting the majors for the id and name matching
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchData();
  }, []); // Ensure it only runs once

  const handleClear = () => {
    setSearchFormData({
      major: null,
      fieldName: "",
    });
  };

  const handleChange = (fieldName, newValue) => {
    setSearchFormData((prevData) => ({
      ...prevData,
      [fieldName]: newValue || "", // Update the relevant field
    }));
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-bar-container">
        <Autocomplete
          className="search-bar-contents"
          options={majors} // Passing the majors instead of elective fields
          getOptionLabel={(option) => option.name || ""}
          value={
            majors.find((major) => major.id === searchFormData.major) || null
          }
          onChange={(event, newValue) => {
            handleChange("major", newValue ? newValue.id : null); // Store the major ID
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Major"
              name="major"
              variant="outlined"
              onChange={getListFields}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={elective_fields}
          getOptionLabel={(option) => option.field_name || ""}
          value={
            elective_fields.find(
              (field) => field.field_name === searchFormData.field_name
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("field_name", newValue ? newValue.field_name : "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Field Name"
              name="field_name"
              variant="outlined"
              onChange={getListFields}
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

export default ElectiveSearchBar;
