import React, { useState, useEffect } from "react";

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
  DialogContentText,
  TextField,
  DialogActions,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import axios from "axios";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import Paper from "@mui/material/Paper";
import CourseSearchBar from "../../Components/Courses/CourseSearchbar";
import PropTypes from "prop-types";
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

const Major = (props) => {
  const [majors, setMajors] = useState([]);
  const [currentEditMajor, setCurrentEditMajor] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
  });

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

  const handleDelete = async (major) => {
    // event handler for the delete button
    await props.checkTokenAndRefresh();
    axios
      .delete(`http://localhost:8000/api/major/${major.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then(() => {
        getListMajors();
      })
      .catch((err) => {
        console.log("Error deleting major: ", err);
      });
  };

  const handleClose = () => {
    setFormData({
      name: "",
      abbreviation: "",
    });
    setOpenDialog(false);
    // Reset form data and close the dialog
    setCurrentEditMajor(null);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
    setFormTitle("Add New Major");
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditClick = async (major) => {
    setFormData({
      name: major.name,
      abbreviation: major.abbreviation,
    });
    setFormTitle("Edit Major");
    setCurrentEditMajor(major);
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = currentEditMajor ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing course
    const url = currentEditMajor
      ? `http://localhost:8000/api/major/${currentEditMajor.id}/` // If editing, use the course ID
      : "http://localhost:8000/api/major/";
    console.log(formData);
    await props.checkTokenAndRefresh();
    await axios[method](url, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    getListMajors();
    setFormData({
      name: "",
      abbreviation: "",
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
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    // Run the async function
    fetchDataAfterTokenRefresh();

    // Empty dependency array ensures this only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Dialog fullWidth open={openDialog} onClose={handleClose}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>{formTitle}</div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ paddingBottom: "10px" }}>
            Please fill out the details of this course.
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="name"
                label="Major Name"
                type="text"
                className="input_textfield"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                required
                autoFocus
                margin="dense"
                id="abbreviation"
                label="Major Abbreviation"
                type="text"
                className="input_textfield"
                value={formData.abbreviation}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <div className="course-main">
        <CourseSearchBar
          token={props.token}
          checkTokenAndRefresh={props.checkTokenAndRefresh}
          userDetails={props.userDetails}
          setMajors={setMajors}
        />
        <div className="course-table">
          <TableContainer
            sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: "3" }}
            component={Paper}
          >
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Major Name</StyledTableCell>
                  <StyledTableCell align="center">Abbreviation</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {majors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <React.Fragment key={row.id}>
                      <StyledTableRow>
                        <StyledTableCell align="center">
                          {row.name}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {row.abbreviation}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {props.userDetails &&
                            props.userDetails.role === "admin" && (
                              <Button
                                sx={{ color: "black" }}
                                onClick={() => handleEditClick(row)}
                              >
                                <AiOutlineEdit />
                              </Button>
                            )}
                          {props.userDetails &&
                            props.userDetails.role === "admin" && (
                              <Button
                                sx={{ color: "red" }}
                                onClick={() => setOpenDelete(true)}
                              >
                                <AiOutlineDelete />
                              </Button>
                            )}
                          <ConfirmationDialog
                            open={openDelete}
                            handleClose={() => {
                              setOpenDelete(false);
                            }}
                            message="Are you sure you wan to delete this major from the database?"
                            handleSubmit={() => {
                              handleDelete(row);
                              setOpenDelete(false);
                            }}
                          />
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
                    count={majors.length}
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
    </div>
  );
};

export default Major;
