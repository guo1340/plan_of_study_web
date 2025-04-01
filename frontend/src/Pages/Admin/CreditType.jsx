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
  Tooltip,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import axios from "axios";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import Paper from "@mui/material/Paper";
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
import BackToHome from "../../Components/BackToHomeDialog";
import Autocomplete from "@mui/material/Autocomplete";
import CreditTypeSearchBar from "../../Components/SearchBars/CreditTypeSearchBar";

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

const CreditType = (props) => {
  const [creditTypes, setCreditTypes] = useState([]);
  const [currentEditCreditType, setCurrentEditCreditType] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [all_majors, setMajors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    major: -1,
    number: -1,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const [openHome, setOpenHome] = useState(false);
  const [majorError, setMajorError] = useState(false);

  const getListCreditTypes = async () => {
    try {
      const response = await axios.get(
        "http://plan-of-study.cs.vt.edu:8000/api/credit-type"
      );
      setCreditTypes(response.data);
    } catch (error) {
      console.error("Error fetching Credit Types:", error);
    }
  };

  const handleDelete = async (CreditType) => {
    await props.checkTokenAndRefresh();
    axios
      .delete(
        `http://plan-of-study.cs.vt.edu:8000/api/credit-type/${CreditType.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      .then(() => getListCreditTypes())
      .catch((error) => console.error("Error deleting Credit Type:", error));
  };

  const handleClose = () => {
    setFormData({
      name: "",
      major: -1,
      number: -1,
    });
    setOpenDialog(false);
    setCurrentEditCreditType(null);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
    setFormTitle("Add New Credit Type");
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditClick = async (CreditType) => {
    setFormData({
      name: CreditType.name,
      major: CreditType.major,
      number: CreditType.number,
    });
    setFormTitle("Edit Credit Type");
    setCurrentEditCreditType(CreditType);
    setOpenDialog(true);
  };

  const handleChangeMajor = (event, newValue) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      major: newValue ? newValue.id : -1,
    }));
    setMajorError(false);
  };

  const getListMajors = () => {
    axios
      .get("http://plan-of-study.cs.vt.edu:8000/api/major/")
      .then((res) => {
        setMajors(res.data);
      })
      .catch((error) => {
        console.error("Error fetching major data:", error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentEditCreditType ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing course
    const url = currentEditCreditType
      ? `http://plan-of-study.cs.vt.edu:8000/api/credit-type/${currentEditCreditType.id}/` // If editing, use the course ID
      : "http://plan-of-study.cs.vt.edu:8000/api/credit-type/";
    await props.checkTokenAndRefresh();
    await axios[method](url, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    getListCreditTypes();
    setFormData({
      name: "",
      major: -1,
      number: -1,
    });
    setOpenDialog(false);
    handleClose();
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
        const creditTypeData = await getListCreditTypes();
        await getListMajors();
        console.log(creditTypeData);
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
      <Dialog fullWidth open={openDialog} onClose={handleClose}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>{formTitle}</div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ paddingBottom: "10px" }}>
            Please fill out the details of this credit type.
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="name"
                label="Credit Type Name"
                type="text"
                className="input_textfield"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />

              <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
                <Autocomplete
                  options={all_majors} // Array of major options
                  getOptionLabel={(option) => option.name} // Display the major's name
                  value={
                    all_majors.find((major) => major.id === formData.major) ||
                    null
                  }
                  onChange={handleChangeMajor}
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
              <TextField
                required
                autoFocus
                margin="dense"
                id="number"
                label="Credit Type Number"
                type="text"
                className="input_textfield"
                value={formData.number === -1 ? "" : formData.number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    // Allow only numeric input
                    setFormData({
                      ...formData,
                      number: value === "" ? -1 : value,
                    });
                  }
                }}
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
        <CreditTypeSearchBar
          token={props.token}
          checkTokenAndRefresh={props.checkTokenAndRefresh}
          userDetails={props.userDetails}
          setCreditTypes={setCreditTypes}
        />
        <div className="course-table">
          <TableContainer
            sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: "3" }}
            component={Paper}
          >
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    Credit Type Name
                  </StyledTableCell>
                  <StyledTableCell align="center">Major Name</StyledTableCell>
                  <StyledTableCell align="center">Number</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {creditTypes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <React.Fragment key={row.id}>
                      <StyledTableRow>
                        <StyledTableCell align="center">
                          {row.name}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Tooltip
                            title={
                              all_majors.find((major) => major.id === row.major)
                                ?.name || "N/A"
                            }
                          >
                            <span>
                              {all_majors.find(
                                (major) => major.id === row.major
                              )?.abbreviation || "N/A"}
                            </span>
                          </Tooltip>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {row.number}
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
                    count={creditTypes.length}
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
      </div>
    </div>
  );
};

export default CreditType;
