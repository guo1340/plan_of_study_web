import axios from "axios";
import React, { useState, useEffect } from "react";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Users from "../../Pages/Admin/Users";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";

const CourseSearchBar = (props) => {
  // Function to handle input changes

  const [searchFormData, setSearchFormData] = useState({
    major: null,
    class_number: null,
    title: "",
    description: "",
    credits: null,
    editable_credits: null,
    elective_field: null,
    seasons: [],
    credit_type: null,
  });

  const [majorList, setMajorList] = useState([]);
  const [seasonList, setSeasonList] = useState([]);
  const [electiveFieldList, setElectiveFieldList] = useState([]);
  const [creditTypeList, setCreditTypeList] = useState([]);
  const [courseList, setCourseList] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const searchQuery = JSON.stringify(searchFormData);
      const response = await axios.get(
        `http://localhost:8000/api/classes/?search=${encodeURIComponent(
          searchQuery
        )}`
      );
      props.setClasses(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getListMajors = async () => {
    axios
      .get("http://localhost:8000/api/major/")
      .then((res) => {
        setMajorList(res.data);
      })
      .catch((error) => {
        console.error("Error fetching major data:", error);
      });
  };

  const getListCreditTypes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/credit-type");
      setCreditTypeList(response.data);
    } catch (error) {
      console.error("Error fetching Credit Types:", error);
    }
  };

  const getListSeasons = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/season");
      setSeasonList(response.data);
    } catch (error) {
      console.error("Error fetching Seasons:", error);
    }
  };

  const getListElectiveFields = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/elective-field"
      );
      setElectiveFieldList(response.data);
    } catch (error) {
      console.error("Error fetching Elective Fields:", error);
    }
  };

  const getListCourses = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/classes");
      setCourseList(response.data);
    } catch (error) {
      console.error("Error fetching Classes:", error);
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
      major: null,
      abbreviation: "",
      class_number: null,
      title: "",
      description: "",
      credits: null,
      editable_credits: null,
      elective_field: null,
      seasons: [],
      credit_type: null,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await props.checkTokenAndRefresh();
        await getListMajors(); // Getting the majors for the id and name matching
        await getListCreditTypes();
        await getListSeasons();
        await getListElectiveFields();
        await getListCourses();
      } catch (error) {
        console.error("Error fetching All Data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-bar-container">
        <Autocomplete
          className="search-bar-contents"
          options={majorList} // Passing the majors instead of templates
          getOptionLabel={(option) => option.name || ""}
          value={
            majorList.find((major) => major.id === searchFormData.major) || null
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
          options={courseList}
          getOptionLabel={(option) => {
            return option.class_number.toString() || "";
          }}
          value={
            courseList.find(
              (course) => course.class_number === searchFormData.class_number
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("class_number", newValue ? newValue.class_number : "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Class Number"
              name="class_number"
              variant="outlined"
              onChange={getListCourses}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={courseList}
          getOptionLabel={(option) => {
            return option.title.toString() || "";
          }}
          value={
            courseList.find(
              (course) => course.title === searchFormData.title
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("ttle", newValue ? newValue.title : "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Class Title"
              name="title"
              variant="outlined"
              onChange={getListCourses}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={courseList}
          getOptionLabel={(option) => {
            return option.description.toString() || "";
          }}
          value={
            courseList.find(
              (course) => course.description === searchFormData.description
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("ttle", newValue ? newValue.description : "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Class Description"
              name="description"
              variant="outlined"
              onChange={getListCourses}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={courseList}
          getOptionLabel={(option) => {
            return option.credits.toString() || "";
          }}
          value={
            courseList.find(
              (course) => course.credits === searchFormData.credits
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("ttle", newValue ? newValue.credits : "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Credit Count"
              name="credits"
              variant="outlined"
              onChange={getListCourses}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={electiveFieldList} // Passing the majors instead of templates
          getOptionLabel={(option) =>
            option.type_name +
              " " +
              option.field_number +
              ": " +
              option.field_name || ""
          }
          value={
            electiveFieldList.find(
              (field) => field.id === searchFormData.elective_field
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("elective_field", newValue ? newValue.id : null); // Store the major ID
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Elective Field"
              name="elective_field"
              variant="outlined"
              onChange={getListCourses}
            />
          )}
        />
        <Autocomplete
          className="search-bar-contents"
          options={creditTypeList} // Passing the majors instead of templates
          getOptionLabel={(option) => option.name || ""}
          value={
            creditTypeList.find(
              (credit_type) => credit_type.id === searchFormData.credit_type
            ) || null
          }
          onChange={(event, newValue) => {
            handleChange("credit_type", newValue ? newValue.id : null); // Store the major ID
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Credit Type"
              name="credit_type"
              variant="outlined"
              onChange={getListCourses}
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

export default CourseSearchBar;
