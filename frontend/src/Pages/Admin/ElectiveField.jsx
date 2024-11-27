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
  Tooltip,
  Box,
  Paper,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import axios from "axios";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import ConfirmationDialog from "../../Components/ConfirmationDialog";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BackToHome from "../../Components/BackToHomeDialog";
import PropTypes from "prop-types";
import { NotificationManager } from "react-notifications";
import ElectiveSearchBar from "../../Components/SearchBars/ElectiveSearchBar";

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

const ElectiveField = (props) => {
  const [elective_fields, setFields] = useState([]);
  const [majors, setMajors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type_name: "",
    major: -1,
    field_name: "",
    field_number: "",
  });
  const [currentEditField, setCurrentEditField] = useState(null); // state variable to hold the field being edited
  const [formTitle, setFormTitle] = useState("");
  const [majorError, setMajorError] = useState(false);
  const [openHome, setOpenHome] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteConfirmationMessage, setDeleteConfirmationMessage] =
    useState("");
  const [deleteFunc, setDeleteFunc] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getListMajors = async () => {
    try {
      const majorRes = await axios.get("http://localhost:8000/api/major");
      setMajors(majorRes.data);
    } catch (error) {
      console.error("Error fetching majors:", error);
    }
  };

  const getListFields = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/elective-field/");
      setFields(res.data);
    } catch (error) {
      console.error("Error fetching elective fields data:", error);
    }
  };
  const handleClickOpen = () => {
    setOpenDialog(true);
    setFormTitle("Add New Elective Field");
  };
  const handleCloseDialog = () => {
    setFormData({ type_name: "", major: -1, field_name: "", field_number: "" });
    setOpenDialog(false);
    setCurrentEditField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentEditField ? "put" : "post"; // Determine the HTTP method for elective field
    const url = currentEditField
      ? `http://localhost:8000/api/elective-field/${currentEditField.id}/` // If editing, use the field ID
      : "http://localhost:8000/api/elective-field/";

    try {
      // Step 1: Create or update the elective field
      await props.checkTokenAndRefresh();
      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // Step 2: Handle closing dialog and refreshing data
      await getListFields();
      await getListMajors();
      handleCloseDialog();
    } catch (error) {
      console.error(
        "Error submitting elective field data or updating template:",
        error
      );
      if (error.response && error.response.data && error.response.data.error) {
        // Display the error from the response
        NotificationManager.error(error.response.data.error, "Error", 5000);
      } else {
        // Fallback for unexpected errors
        NotificationManager.error(
          "An unexpected error occurred.",
          "Error",
          5000
        );
      }
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDelete = async (field) => {
    // event handler for the delete button
    try {
      await axios.delete(
        `http://localhost:8000/api/elective-field/${field.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      handleCloseDialog();
      getListFields();
    } catch (error) {
      console.error("Error deleting field: ", error);
    }
  };

  const handleEditClick = (field) => {
    setFormData({
      type_name: field.type_name,
      major: field.major,
      field_name: field.field_name,
      field_number: field.field_number,
    });
    setCurrentEditField(field);
    setOpenDialog(true);
  };

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        await props.checkTokenAndRefresh();
        // Check token only after the async operation
        const token = localStorage.getItem("UserRole");
        if (!props.token || token !== "admin") {
          setOpenHome(true); // Open dialog if no token is available
        }
        await getListFields();
        await getListMajors();
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };
    fetchDataAfterTokenRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.token]);

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
    <div style={{ padding: "25px" }}>
      <div className="course-main">
        <ElectiveSearchBar
          token={props.token}
          checkTokenAndRefresh={props.checkTokenAndRefresh}
          userDetails={props.userDetails}
          setFields={setFields}
        />
        <div className="course-table">
          <TableContainer
            sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: "3" }}
            component={Paper}
          >
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Type Name</StyledTableCell>
                  <StyledTableCell align="center">Major</StyledTableCell>
                  <StyledTableCell align="center">Field Name</StyledTableCell>
                  <StyledTableCell align="center">Field Number</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {elective_fields.map((field, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell align="center">
                      {field.type_name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip
                        title={
                          majors.find((major) => major.id === field.major)
                            ?.name || "N/A"
                        }
                      >
                        <span>
                          {majors.find((major) => major.id === field.major)
                            ?.abbreviation || "N/A"}
                        </span>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.field_name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.field_number}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        sx={{ color: "black" }}
                        onClick={() => handleEditClick(field)}
                      >
                        <AiOutlineEdit />
                      </Button>
                      <Button
                        sx={{ color: "red" }}
                        onClick={() => {
                          setDeleteConfirmation(true);
                          setDeleteConfirmationMessage(
                            "Are you sure you wan to delete this elective field from the database?"
                          );
                          setDeleteFunc(() => () => handleDelete(field));
                        }}
                      >
                        <AiOutlineDelete />
                      </Button>
                      <ConfirmationDialog
                        open={deleteConfirmation}
                        handleClose={() => {
                          setDeleteConfirmation(false);
                          setDeleteConfirmationMessage("");
                          setDeleteFunc(null);
                        }}
                        message={deleteConfirmationMessage}
                        handleSubmit={() => {
                          if (deleteFunc) deleteFunc(); // Call deleteFunc if it’s set
                          setDeleteConfirmation(false);
                          setDeleteConfirmationMessage("");
                          setDeleteFunc(null);
                        }}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter className="table-footer">
                <TableRow sx={{ width: "100%" }}>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={7}
                    count={elective_fields.length}
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
      </div>
      <Dialog fullWidth open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>{formTitle}</div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Type Name</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="type_name"
                label="Type Name"
                type="text"
                className="input_textfield"
                value={formData.type_name}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <Autocomplete
                options={majors}
                getOptionLabel={(option) => option.name}
                value={
                  majors.find((major) => major.id === formData.major) || null
                }
                onChange={(e, newValue) => {
                  setFormData({
                    ...formData,
                    major: newValue ? newValue.id : -1,
                  });
                  setMajorError(false);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Major *"
                    variant="outlined"
                    fullWidth
                    error={majorError}
                    helperText={majorError ? "Please select a major" : ""}
                  />
                )}
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Field Name</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="field_name"
                label="Field Name"
                type="text"
                className="input_textfield"
                value={formData.field_name}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Field Number</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="field_number"
                label="Field Number"
                type="text"
                className="input_textfield"
                value={formData.field_number}
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
  );
};

export default ElectiveField;
