import React, { useState, useEffect } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import ListItemText from "@mui/material/ListItemText";
import {
  AiOutlineEdit,
  AiOutlineInfoCircle,
  AiTwotonePlusCircle,
  AiOutlineDelete,
} from "react-icons/ai";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Courses = (props) => {
  const [classes, setClasses] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false); // state variable to control the visibility of the drawer
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null); // state variable to hold the course that will be displayed in info
  const [currentEditCourse, setCurrentEditCourse] = useState(null); // state variable to hold the course being edited
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    major: "",
    abbreviation: "",
    title: "",
    prereqs: [],
    seasons: [],
    coreqs: [],
    description: "",
    credits: "",
    elective_field: -1,
    editable_credits: false,
  });

  const [majors, setMajors] = useState([]);
  const [form_elective_fields, setFormElectiveFields] = useState([]);
  const [elective_fields, setElectiveFields] = useState([]);
  const [all_seasons, setSeasons] = useState([]);

  const handleEditClick = (course) => {
    // Set the form data to the values from the course to be edited
    setFormData({
      major: course.major,
      abbreviation: course.abbreviation,
      title: course.title,
      prereqs: course.prereqs,
      seasons: course.seasons,
      coreqs: course.coreqs,
      description: course.description,
      credits: course.credits,
      elective_field: course.elective_field,
      editable_credits: course.editable_credits,
    });
    setCurrentEditCourse(course); // Save the current course being edited
    setOpenDialog(true); // Open the dialog form
  };

  const drawerWidth = 400;

  const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }) => ({
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
      ...(open && {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      }),
      /**
       * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
       * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
       * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
       * proper interaction with the underlying content.
       */
      position: "relative",
    })
  );

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  }));

  const getListMajors = () => {
    axios
      .get("http://localhost:8000/api/template/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setMajors(res.data);
      })
      .catch((error) => {
        console.error("Error fetching major template data:", error);
      });
  };

  const getListCourses = async () => {
    try {
      const courseResponse = await axios.get(
        "http://localhost:8000/api/classes/"
      );
      const coursesData = courseResponse.data;

      const coursesWithElectiveFields = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const electiveFieldResponse = await axios.get(
              `http://localhost:8000/api/elective-field/${course.elective_field}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            const electiveFieldData = electiveFieldResponse.data;

            // Assign the elective field object to the course
            course.elective_field_object = electiveFieldData;
            return course;
          } catch (error) {
            console.error(
              "Error fetching elective field for course:",
              course.id,
              error
            );
            return course;
          }
        })
      );

      setClasses(coursesWithElectiveFields);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const getListSeasons = () => {
    axios
      .get("http://localhost:8000/api/season/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setSeasons(res.data);
      })
      .catch((error) => {
        console.error("Error fetching seasons data:", error);
      });
  };

  const handleInfoClick = (course) => {
    // event handler for the info button
    setSelectedCourseInfo(course);
    setDrawerOpen(true);
  };

  const handleDelete = (course) => {
    // event handler for the delete button
    axios
      .delete(`http://localhost:8000/api/classes/${course.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then(() => {
        getListCourses();
      })
      .catch((err) => {
        console.log("Error deleting course: ", err);
      });
  };

  const handleDrawerClose = () => {
    // event handler for the drawer
    setDrawerOpen(false);
  };

  const handleClose = () => {
    setFormData({
      major: "",
      abbreviation: "",
      title: "",
      prereqs: [],
      seasons: [],
      coreqs: [],
      description: "",
      credits: "",
      elective_field: -1,
      editable_credits: false,
    });
    setOpenDialog(false);
    // Reset form data and close the dialog
    setCurrentEditCourse(null);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = currentEditCourse ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing course
    const url = currentEditCourse
      ? `http://localhost:8000/api/classes/${currentEditCourse.id}/` // If editing, use the course ID
      : "http://localhost:8000/api/classes/";
    console.log(formData);
    axios[method](url, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then(() => {
        axios
          .get("http://localhost:8000/api/classes/")
          .then((res) => {
            console.log("hello I am Here");
            console.log(res.data);
            console.log("yup right here");
            setClasses(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    setFormData({
      major: "",
      abbreviation: "",
      title: "",
      prereqs: [],
      seasons: [],
      coreqs: [],
      description: "",
      credits: "",
      elective_field: -1,
      editable_credits: false,
    });
    setOpenDialog(false);
    handleClose();
  };

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();

        // Only after token check is done, fetch the other data
        getListMajors();
        getListCourses();
        getListSeasons();
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    // Run the async function
    fetchDataAfterTokenRefresh();

    // Empty dependency array ensures this only runs once
  }, []);

  const class_options = classes.map((cls) => ({
    value: cls.id,
    label: `${cls.abbreviation} - ${cls.title}`,
  }));

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  // Handling change for MUI Select (adjusted for multi-select) for prereqs
  const handlePrereqsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prevFormData) => ({
      ...prevFormData,
      prereqs:
        typeof value === "string"
          ? value
              .split(",")
              .map(
                (val) =>
                  class_options.find((option) => option.label === val).value
              )
          : value,
    }));
  };

  // Handling change for MUI Select for coreqs
  const handleCoreqsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prevFormData) => ({
      ...prevFormData,
      coreqs:
        typeof value === "string"
          ? value
              .split(",")
              .map(
                (val) =>
                  class_options.find((option) => option.label === val).value
              )
          : value,
    }));
  };

  const handleChangeMajor = async (e) => {
    const { name, value } = e.target; // Get the selected major value
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Update the form data with the selected major
    }));

    // Fetch elective fields for the selected major
    try {
      const response = await axios.get(
        `http://localhost:8000/api/elective-field/`,
        {
          params: { major: value }, // Pass the selected major as a query parameter
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const electiveFields = response.data.sort(
        (a, b) => a.field_number - b.field_number
      );

      // Set the elective fields for the selected major in the state
      setFormElectiveFields(electiveFields);
    } catch (error) {
      console.error("Error fetching elective fields:", error);
    }
  };

  const handleChangeElectiveField = (event) => {
    const { value } = event.target;

    const selectedElectiveField = form_elective_fields.find(
      (field) => field.id === value
    );

    if (selectedElectiveField) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        elective_field: selectedElectiveField.id,
      }));
    }
  };

  const handleChangeSeason = (event) => {
    const {
      target: { value },
    } = event;

    // Update formData by mapping selected season names to their corresponding ids
    setFormData((prevFormData) => ({
      ...prevFormData,
      seasons: value
        .map((selectedName) => {
          const matchedSeason = all_seasons.find(
            (season) => season.name === selectedName
          );
          return matchedSeason ? matchedSeason.id : null;
        })
        .filter((id) => id !== null), // Ensure only valid IDs are stored
    }));
  };

  return (
    <div style={{ padding: "25px" }}>
      <Button
        className="addButton"
        // variant="contained"
        // size="medium"
        onClick={handleClickOpen}
      >
        <AiTwotonePlusCircle />
      </Button>
      <Dialog fullWidth open={openDialog} onClose={handleClose}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>Add Course</div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ paddingBottom: "10px" }}>
            Please fill out the details of this new course.
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <div className="form-input-title">
              <div>Major</div>
              {/* <TextField
                required
                autoFocus
                margin="dense"
                id="major"
                label="Major"
                type="text"
                className="input_textfield"
                value={formData.major}
                onChange={handleChange}
                fullWidth
              /> */}
              <Select
                labelId="demo-single-select-label"
                name="major" // Make sure this matches the field name in formData
                fullWidth
                value={formData.major} // This is now a string
                onChange={handleChangeMajor}
                input={<OutlinedInput label="Major" />} // Updated label
              >
                {majors.map((template) => (
                  <MenuItem key={template.major} value={template.major}>
                    <ListItemText primary={template.major} />
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Class Abbreviation</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="abbreviation"
                label="Class Abbreviation"
                type="text"
                className="input_textfield"
                value={formData.abbreviation}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Class Name</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="title"
                label="Class Name"
                type="text"
                className="input_textfield"
                value={formData.title}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Prerequisite</div>
              <Select
                labelId="demo-multiple-prereq-label"
                id="demo-multiple-prereq"
                multiple
                value={formData.prereqs} // This should be an array of selected ids
                onChange={handlePrereqsChange}
                fullWidth
                label="Select"
                input={
                  <OutlinedInput
                    id="select-multiple-prereq"
                    label="Prerequisite"
                  />
                }
                renderValue={(selectedIds) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedIds.map((id) => {
                      // Find the label corresponding to the id
                      const label =
                        class_options.find((option) => option.value === id)
                          ?.label || "";
                      return <Chip key={id} label={label} />;
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {class_options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Offered Term(s)</div>
              <Select
                labelId="seasons_select"
                name="seasons"
                fullWidth
                multiple
                value={formData.seasons.map((seasonId) => {
                  const matchedSeason = all_seasons.find(
                    (season) => season.id === seasonId
                  );
                  return matchedSeason ? matchedSeason.name : "";
                })}
                onChange={handleChangeSeason}
                input={<OutlinedInput label="Season" />}
                renderValue={(selectedNames) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedNames.map((name) => (
                      <Chip key={name} label={name} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {all_seasons.map((season) => (
                  <MenuItem key={season.id} value={season.name}>
                    <ListItemText primary={season.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Corequisite</div>
              <Select
                labelId="demo-multiple-coreq-label"
                id="demo-multiple-coreq"
                multiple
                value={formData.coreqs} // This should be an array of selected ids
                onChange={handleCoreqsChange}
                fullWidth
                label="Select"
                input={
                  <OutlinedInput
                    id="select-multiple-coreq"
                    label="Corequisite"
                  />
                }
                renderValue={(selectedIds) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedIds.map((id) => {
                      // Find the label corresponding to the id
                      const label =
                        class_options.find((option) => option.value === id)
                          ?.label || "";
                      return <Chip key={id} label={label} />;
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {class_options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Description</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="description"
                label="Description"
                type="text"
                className="input_textfield"
                value={formData.description}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Credits</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="credits"
                label="Credits"
                type="text"
                className="input_textfield"
                value={formData.credits}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div>Is Credit Editable</div>
            <FormControlLabel
              control={<Switch id="editable_credits" onChange={handleChange} />}
            />
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Elective Field</div>
              <Select
                labelId="elective_field_select"
                name="elective_field" // Make sure this matches the field name in formData
                fullWidth
                value={formData.elective_field} // This is now a string
                onChange={handleChangeElectiveField}
                input={<OutlinedInput label="ElectiveField" />} // Updated label
              >
                {form_elective_fields.map((elective_field) => (
                  <MenuItem key={elective_field.id} value={elective_field.id}>
                    <ListItemText
                      primary={
                        elective_field.type_name +
                        " " +
                        elective_field.field_number +
                        ": " +
                        elective_field.field_name
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            </div>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      {/* <Box sx={{ display: "flex" }}> */}
      <Main open={drawerOpen}>
        <DrawerHeader />
        <TableContainer component={Paper}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Course Name</StyledTableCell>
                <StyledTableCell align="center">Full Name</StyledTableCell>
                <StyledTableCell align="center">Major</StyledTableCell>
                <StyledTableCell align="center">Term</StyledTableCell>
                <StyledTableCell align="center">Credits</StyledTableCell>
                <StyledTableCell align="center">Elective Field</StyledTableCell>
                <StyledTableCell align="center">Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((row) => (
                <StyledTableRow key={row.abbreviation}>
                  <StyledTableCell align="center" component="th" scope="row">
                    {row.abbreviation}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.title}</StyledTableCell>
                  <StyledTableCell align="center">{row.major}</StyledTableCell>
                  <StyledTableCell align="center">
                    {row.seasons.map((season) => {
                      const matchedSeason = all_seasons.find(
                        (temp_season) => temp_season.id === season
                      );
                      return <li>{matchedSeason.name}</li>;
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.credits}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.elective_field_object
                      ? `${row.elective_field_object.type_name} ${row.elective_field_object.field_number}: ${row.elective_field_object.field_name}`
                      : "Elective Field Not Found"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Button
                      // style={{ background: "#7a1c27" }}
                      onClick={() => handleEditClick(row)}
                    >
                      {/* <div className="text"> */}
                      <AiOutlineEdit />
                      {/* </div> */}
                    </Button>
                    <Button
                      // style={{ background: "#7a1c27" }}
                      onClick={() => handleInfoClick(row)}
                    >
                      {/* <div className="text"> */}
                      <AiOutlineInfoCircle />
                      {/* </div> */}
                    </Button>
                    <Button onClick={() => handleDelete(row)}>
                      <AiOutlineDelete />
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Main>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            top: 185,
            padding: "20px",
          },
        }}
        variant="persistent"
        anchor="right"
        open={drawerOpen}
      >
        <DrawerHeader>
          <Button
            style={{ right: "10px", bottom: "20px" }}
            onClick={handleDrawerClose}
          >
            <div style={{ color: "black" }}>X</div>
          </Button>
        </DrawerHeader>
        <div style={{ marginTop: "-50px" }}>
          {selectedCourseInfo && (
            <div>
              <h2>Course Information</h2>
              <p>
                <b>Major:</b> {selectedCourseInfo.major}
              </p>
              <p>
                <b>Abbreviation:</b> {selectedCourseInfo.abbreviation}
              </p>
              <p>
                <b>Title:</b> {selectedCourseInfo.title}
              </p>
              <p>
                <b>Prerequisites:</b> {selectedCourseInfo.prereqs.join(", ")}
              </p>
              <p>
                <b>Term:</b>{" "}
                {selectedCourseInfo.seasons.map((season) => {
                  const matchedSeason = all_seasons.find(
                    (temp_season) => temp_season.id === season
                  );
                  return <li>{matchedSeason.name}</li>;
                })}
              </p>
              <p>
                <b>Corequisites:</b> {selectedCourseInfo.coreqs.join(", ")}
              </p>
              <p>
                <b>Description:</b> {selectedCourseInfo.description}
              </p>
              <p>
                <b>Credits:</b> {selectedCourseInfo.credits}
              </p>
            </div>
          )}
        </div>
      </Drawer>
      {/* </Box> */}
    </div>
  );
};

export default Courses;
