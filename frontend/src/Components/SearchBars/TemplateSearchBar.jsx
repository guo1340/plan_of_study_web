import axios from "axios";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { major, TextField } from "@mui/material";

const TemplateSearchBar = (props) => {
  const [searchFormData, setSearchFormData] = useState({
    major: null,
    level: "",
  });

  const [templates, setTemplates] = useState([]);
  const [majors, setMajors] = useState([]);
  const [uniqueLevels, setUniqueLevels] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on submit
    try {
      const searchQuery = JSON.stringify(searchFormData);
      const response = await axios.get(
        `http://localhost:8000/api/template/?search=${encodeURIComponent(
          searchQuery
        )}`
      );
      props.setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // To ensure the warning of duplicate levels doesnt occur
  const getUniqueLevels = (templates) => {
    const seen = new Set();
    return templates
      .map((template) => template.level)
      .filter((level) => {
        if (seen.has(level)) {
          return false;
        }
        seen.add(level);
        return true;
      });
  };

  const getListMajors = () => {
    axios
      .get("http://localhost:8000/api/major/")
      .then((res) => {
        setMajors(res.data);
      })
      .catch((error) => {
        console.error("Error fetching major data:", error);
      });
  };

  const getListTemplates = () => {
    axios
      .get("http://localhost:8000/api/template/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setTemplates(res.data);
        setUniqueLevels(getUniqueLevels(res.data));
      })
      .catch((error) => {
        console.error("Error fetching templates data:", error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await props.checkTokenAndRefresh();
        await getListTemplates();
        await getListMajors();  // Getting the majors for the id and name matching

      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchData();
  }, []); // Ensure it only runs once


  const handleClear = () => {
    setSearchFormData({
      major: null,
      level: "",
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
            options={majors} // Passing the majors instead of templates
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
                onChange={getListTemplates}
              />
            )}
          />
        <Autocomplete
            className="search-bar-contents"
            options={uniqueLevels} // Passing the unique levels instead of the template object
            getOptionLabel={(option) => option || ""}
            value={searchFormData.level || ""} 
            onChange={(event, newValue) => {
              handleChange("level", newValue || "");
            }}    
            renderInput={(params) => (
              <TextField
                {...params}
                label="Level"
                name="level"
                variant="outlined"
                onChange={getListTemplates}
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

export default TemplateSearchBar;
