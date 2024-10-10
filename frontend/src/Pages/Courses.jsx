import React, { useState, useEffect } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
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
  AiOutlineDelete,
} from "react-icons/ai";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#800000",
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

const TablePaginationActions = (props) => {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
};

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

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
  const [all_seasons, setSeasons] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const emptyRows =
  //   page > 0 ? Math.max(0, (1 + page) * rowsPerPage - classes.length) : 0;

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
      .get("http://localhost:8000/api/template/")
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
              `http://localhost:8000/api/elective-field/${course.elective_field}`
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
      .get("http://localhost:8000/api/season/")
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div>
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
      <div className="course-main" open={drawerOpen}>
        <div className="course-search-bar"></div>
        {/* <DrawerHeader /> */}
        <div className="course-table">
          <TableContainer
            sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: "3" }}
            component={Paper}
          >
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Course Name</StyledTableCell>
                  {/* <StyledTableCell align="center">Full Name</StyledTableCell> */}
                  <StyledTableCell align="center">Major</StyledTableCell>
                  <StyledTableCell align="center">Term</StyledTableCell>
                  <StyledTableCell align="center">Credits</StyledTableCell>
                  <StyledTableCell align="center">
                    Elective Field
                  </StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((row) => (
                  <StyledTableRow key={row.id}>
                    <Tooltip
                      title={"Full Name: " + row.title}
                      placement="right"
                    >
                      <StyledTableCell
                        align="center"
                        component="th"
                        scope="row"
                      >
                        {row.abbreviation}
                      </StyledTableCell>
                    </Tooltip>

                    {/* <StyledTableCell align="center">
                      {row.title}
                    </StyledTableCell> */}
                    <StyledTableCell align="center">
                      {row.major}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.seasons.map((season) => {
                        const matchedSeason = all_seasons.find(
                          (temp_season) => temp_season.id === season
                        );
                        return (
                          <li
                            style={{ "list-style-type": "none" }}
                            key={matchedSeason.name}
                          >
                            {matchedSeason.name}
                          </li>
                        );
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
                      <Button onClick={() => handleEditClick(row)}>
                        <AiOutlineEdit />
                      </Button>
                      <Button onClick={() => handleInfoClick(row)}>
                        <AiOutlineInfoCircle />
                      </Button>
                      <Button onClick={() => handleDelete(row)}>
                        <AiOutlineDelete />
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter className="table-footer">
                <TableRow sx={{ width: "100%" }}>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={7}
                    count={classes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>
        <IconButton
          className="add-course-button"
          aria-label="add"
          onClick={handleClickOpen}
          sx={{
            position: "absolute",
            bottom: "20px", // Adjust to your preference
            right: "20px", // Adjust to your preference
            backgroundColor: "#800000", // Button color
            color: "#fff", // Text/icon color
            "&:hover": {
              backgroundColor: "#600000", // Darker shade on hover
            },
          }}
        >
          <AddCircleOutlineIcon />
        </IconButton>
      </div>
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
                  return (
                    <li
                      style={{ "list-style-type": "none" }}
                      key={matchedSeason.name}
                    >
                      {matchedSeason.name}
                    </li>
                  );
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
    </div>
  );
};

export default Courses;
