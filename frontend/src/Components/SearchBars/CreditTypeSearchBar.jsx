import axios from "axios";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { major, TextField } from "@mui/material";

const CreditTypeSearchBar = (props) => {
  const [searchFormData, setSearchFormData] = useState({
    name: "",
    major: -1,
    number: -1,
  });

  const [majors, setMajors] = useState([]);
  const [creditTypes, setCreditTypes] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on submit
    try {
      const searchQuery = JSON.stringify(searchFormData);
      const response = await axios.get(
        `http://localhost:8000/api/credit-type/?search=${encodeURIComponent(
          searchQuery
        )}`
      );
      props.setCreditTypes(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

  const getListCreditTypes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/credit-type");
      setCreditTypes(response.data);
    } catch (error) {
      console.error("Error fetching Credit Types:", error);
    }
  };

  const handleChange = (fieldName, newValue) => {
    setSearchFormData((prevData) => ({
      ...prevData,
      [fieldName]: newValue || "", // Update the relevant field
    }));
  };

  const handleClear = () => {
    setSearchFormData({
      name: "",
      major: null,
      number: null,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await props.checkTokenAndRefresh();
        await getListMajors();  // Getting the majors for the id and name matching
        await getListCreditTypes();

      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchData();
  }, []); // Ensure it only runs once

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-bar-container">
      <Autocomplete
            className="search-bar-contents"
            options={creditTypes} 
            getOptionLabel={(option) => option.name || ""}
            value={
                creditTypes.find((type) => type.name === searchFormData.name) || null
            }
            onChange={(event, newValue) => {
                handleChange("name", newValue ? newValue.name : "");
            }}    
            renderInput={(params) => (
              <TextField
                {...params}
                label="Credit Type Name"
                name="name"
                variant="outlined"
                onChange={getListCreditTypes}
              />
            )}
          />
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
                label="Major Name"
                name="major"
                variant="outlined"
                onChange={getListCreditTypes}
              />
            )}
          />
        <Autocomplete
            className="search-bar-contents"
            options={creditTypes} 
            getOptionLabel={(option) => option.number.toString() || ""}
            value={
                creditTypes.find((type) => type.number === searchFormData.number) || null
            }
            onChange={(event, newValue) => {
                handleChange("number", newValue ? newValue.number : "");
            }}    
            renderInput={(params) => (
              <TextField
                {...params}
                label="Number"
                name="number"
                variant="outlined"
                onChange={getListCreditTypes}
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

export default CreditTypeSearchBar;
