import {
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Drawer,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import axios from "axios";
import {
  AiOutlineEdit,
  AiOutlineInfoCircle,
  AiOutlineDelete,
} from "react-icons/ai";
import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import ConfirmationDialog from "../../Components/ConfirmationDialog";
import TableFooter from "@mui/material/TableFooter";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PropTypes from "prop-types";
import CourseSearchBar from "../../Components/Courses/CourseSearchbar";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import BackToHome from "../../Components/BackToHomeDialog";

const drawerWidth = 400;

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

const Template = (props) => {
  const [templates, setTemplates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formData, setFormData] = useState({
    min_credits: "",
    min_elective_fields: "",
    min_each_Elective: "",
    major: "",
    elective_fields: [],
  });
  const [currentEditTemplate, setCurrentEditTemplate] = useState(null); // state variable to hold the field being edited
  const [openDrawer, setOpenDrawer] = useState(false);
  const [elective_fields, setElectiveFields] = useState([]);
  const [openHome, setOpenHome] = useState(false);

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  }));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
    setFormTitle("Add New Template");
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
      })
      .catch((error) => {
        console.error("Error fetching templates data:", error);
      });
  };
  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };
  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
    setCurrentEditTemplate(null);
    setElectiveFields([]);
  };
  const handleCloseDialog = () => {
    setFormData({ type_name: "", major: "", field_name: "", field_number: "" });
    setOpenDialog(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentEditTemplate ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing field
    const url = currentEditTemplate
      ? `http://localhost:8000/api/template/${currentEditTemplate.id}/` // If editing, use the field ID
      : "http://localhost:8000/api/template/";
    console.log(formData);
    handleCloseDialog();
    // axios[method](url, formData).then(getListTemplates());
    try {
      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      handleCloseDialog();
      getListTemplates();
    } catch (error) {
      console.error("Error submitting template data:", error);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDelete = async (template) => {
    // event handler for the delete button
    try {
      await axios.delete(`http://localhost:8000/api/template/${template.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      handleCloseDialog();
      getListTemplates();
    } catch (error) {
      console.error("Error deleting template: ", error);
    }
  };

  const handleInfo = async (template) => {
    // event handler for the info button
    if (!openDrawer || currentEditTemplate.id === template.id) {
      toggleDrawer();

      setCurrentEditTemplate(template);
      try {
        const ids = template.elective_fields; // array of elective field ids
        const promises = ids.map((id) =>
          fetch(`http://localhost:8000/api/elective-field/${id}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }).then((res) => res.json())
        );
        let electiveFields = await Promise.all(promises); // get all elective field objects

        electiveFields = electiveFields.sort(
          (a, b) => a.field_number - b.field_number
        );
        // Store the fetched elective fields in state for display
        setElectiveFields(electiveFields);
      } catch (error) {
        console.error("Error fetching elective fields:", error);
      }
    }
  };

  const handleEditClick = (template) => {
    setFormData({
      // TODO
    });
    setCurrentEditTemplate(template);
    setOpenDialog(true);
    setFormTitle("Edit Template");
  };

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();

        if (!props.token || localStorage.getItem("UserRole") !== "admin") {
          setOpenHome(true); // Open dialog if no token is available
        }

        // Only after token check is done, fetch the other data
        getListTemplates();
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    // Run the async function
    fetchDataAfterTokenRefresh();

    // Empty dependency array ensures this only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!props.token) {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="Please login first"
      />
    );
  }

  if (localStorage.getItem("userRole") !== "admin") {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="You must be an Admin user to access this page ~"
      />
    );
  }

  return (
    <div>
      <div className="course-main">
        <CourseSearchBar
          token={props.token}
          checkTokenAndRefresh={props.checkTokenAndRefresh}
          userDetails={props.userDetails}
          setTemplates={setTemplates}
        />
        <div className="course-table">
          <TableContainer
            sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: "3" }}
            component={Paper}
          >
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    Minimum Credits
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    Minimum Number of Elective Fields to Take
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    Minimum Number of Each Elective Fields to Take
                  </StyledTableCell>
                  <StyledTableCell align="center">Major</StyledTableCell>
                  <StyledTableCell align="center">
                    Number of Elective Fields
                  </StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((template, index) => (
                    <React.Fragment key={template.id}>
                      <StyledTableRow key={index}>
                        <StyledTableCell align="center">
                          {template.min_credits}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.min_elective_fields}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.min_each_Elective}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.major}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.elective_fields.length}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Button>
                            <AiOutlineEdit
                              onClick={() => handleEditClick(template)}
                            />
                          </Button>
                          <Button onClick={() => handleInfo(template)}>
                            <AiOutlineInfoCircle />
                          </Button>
                          <Button onClick={() => handleDelete(template)}>
                            <AiOutlineDelete />
                          </Button>
                        </StyledTableCell>
                      </StyledTableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
              <TableFooter className="table-footer">
                <TableRow sx={{ width: "100%" }}>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={7}
                    count={templates.length}
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
        {props.userDetails && props.userDetails.role === "admin" && (
          <IconButton
            className="add-course-button"
            aria-label="add"
            onClick={handleClickOpen}
            sx={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              backgroundColor: "#800000",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#600000",
              },
            }}
          >
            <AddCircleOutlineIcon />
          </IconButton>
        )}
      </div>
      <Dialog fullWidth open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>{formTitle}</div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Minimum Credits</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_credits"
                label="Minimum Credits"
                type="text"
                className="input_textfield"
                value={formData.min_credits}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Major</div>
              <TextField
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
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Minimum Number of Elective Fields to Take</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_elective_fields"
                label="Minimum Number of Elective Fields to Take"
                type="text"
                className="input_textfield"
                value={formData.min_elective_fields}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Minimum Number of Each Elective Fields to Take</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_each_Elective"
                label="Minimum Number of Each Elective Fields to Take"
                type="text"
                className="input_textfield"
                value={formData.min_each_Elective}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      {/* <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
          variant="persistent"
          anchor="right"
          open={openDrawer}
        >
          <DrawerHeader>
            <Button
              style={{ right: "10px", bottom: "20px" }}
              onClick={toggleDrawer}
            >
              <div style={{ color: "black" }}>X</div>
            </Button>
          </DrawerHeader>
          <div style={{ marginTop: "-50" }}>
            {currentEditTemplate && (
              <div>
                <h2>Template Info</h2>

                <p>
                  <b>Major:</b> {currentEditTemplate.major}
                </p>
                <p>
                  <b>Minimum Credits:</b> {currentEditTemplate.min_credits}
                </p>
                <p>
                  <b>Minimum Number of Elective Fields to Take:</b>{" "}
                  {currentEditTemplate.min_elective_fields}
                </p>
                <p>
                  <b>Minimum Number of Each Elective Fields to Take:</b>{" "}
                  {currentEditTemplate.min_each_Elective}
                </p>
                <p>
                  <b>Elective Fields:</b>{" "}
                  {elective_fields.map((elective_field) => {
                    return (
                      <li>
                        {elective_field.type_name +
                          " " +
                          elective_field.field_number +
                          ": " +
                          elective_field.field_name +
                          "\n"}
                      </li>
                    );
                  })}
                </p>
              </div>
            )}
          </div>
        </Drawer> */}
    </div>
  );
};

export default Template;
