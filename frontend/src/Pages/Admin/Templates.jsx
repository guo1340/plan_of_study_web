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
  Box,
  Tooltip,
  MenuItem,
  Switch,
  FormControlLabel,
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
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import BackToHome from "../../Components/BackToHomeDialog";
import Autocomplete from "@mui/material/Autocomplete";
import Collapse from "@mui/material/Collapse";
import DialogContentText from "@mui/material/DialogContentText";
import TemplateSearchBar from "../../Components/SearchBars/TemplateSearchBar";
import { NotificationManager } from "react-notifications";

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

const Template = (props) => {
  const [templates, setTemplates] = useState([]);
  const [openMainDialog, setOpenMainDialog] = useState(false);
  const [openRequirementDialog, setOpenRequirementDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteConfirmationMessage, setDeleteConfirmationMessage] =
    useState("");
  const [deleteFunc, setDeleteFunc] = useState(null);
  const [formData, setFormData] = useState({
    min_credits: "",
    major: null,
    level: "",
    min_elective_fields: "",
    min_each_Elective: "",
    requirements: [],
    min_semester_credits: null,
    max_semester_credits: null,
  });
  const [requirementFormData, setRequirementFormData] = useState({
    id: null,
    attribute: "",
    attribute_value: null,
    attribute_choice: "",
    include: true,
    major: null,
    requirement_size: null,
    requirement_type: "",
    credit_type: null,
  });
  const [templateRequirements, setTemplateRequirements] = useState([]);
  const [openInfo, setOpenInfo] = useState(null);
  const [currentEditTemplate, setCurrentEditTemplate] = useState(null); // state variable to hold the field being edited
  const [currentEditRequirement, setCurrentEditRequirement] = useState(null); // state variable to hold the field being edited
  const [openHome, setOpenHome] = useState(false);
  const COMPARISON_CHOICES = {
    "==": "is",
    ">=": "is at least",
    "<=": "is at most",
    ">": "is more than",
    "<": "is less than",
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpenMainDialog(true);
    setFormTitle("Add New Template");
  };

  const handleClickOpenRequirement = () => {
    setOpenRequirementDialog(true);
  };

  const [all_majors, setMajors] = useState([]);
  const [all_credit_types, setCreditTypes] = useState([]);
  const [majorError, setMajorError] = useState(false);
  const [creditTypeError, setCreditTypeError] = useState(false);
  const [majorRequirementError, setMajorRequirementError] = useState(false);
  const [attributeChoiceError, setAttributeChoiceError] = useState(false);
  const [attributeValueError, setAttributeValueError] = useState(false);

  const handleChangeMajor = (event, newValue) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      major: newValue ? newValue.id : "", // Ensure coreqs is always an array
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

  const getListCreditTypes = () => {
    axios
      .get("http://plan-of-study.cs.vt.edu:8000/api/credit-type/")
      .then((res) => {
        setCreditTypes(res.data);
      })
      .catch((error) => {
        console.error("Error fetching credit-type data:", error);
      });
  };

  const fetchRequirements = async (template) => {
    try {
      const requirementsData = await Promise.all(
        template.requirements.map(async (requirementId) => {
          try {
            // Fetch the main requirement object
            const requirementResponse = await axios.get(
              `http://plan-of-study.cs.vt.edu:8000/api/requirement/${requirementId}/`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            const requirement = requirementResponse.data;

            // Fetch the major object for the requirement
            const majorResponse = await axios.get(
              `http://plan-of-study.cs.vt.edu:8000/api/major/${requirement.major}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            requirement.major_name = majorResponse.data.name; // Attach major name to requirement

            // Fetch the credit type object for the requirement
            const creditTypeResponse = await axios.get(
              `http://plan-of-study.cs.vt.edu:8000/api/credit-type/${requirement.credit_type}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            requirement.credit_type_name = creditTypeResponse.data.name; // Attach credit type name to requirement

            return requirement;
          } catch (error) {
            console.error(
              "Error fetching data for requirement:",
              requirementId,
              error
            );
            return null; // Return null or an empty object if there's an error for a specific requirement
          }
        })
      );

      // Filter out any null values from the list of requirements
      setTemplateRequirements(requirementsData.filter((req) => req !== null));
    } catch (error) {
      console.error("Error fetching requirements:", error);
    }
  };

  const getListTemplates = () => {
    axios
      .get("http://plan-of-study.cs.vt.edu:8000/api/template/", {
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

  const handleCloseDialog = () => {
    setFormData({
      min_credits: "",
      major: null,
      level: "",
      min_elective_fields: "",
      min_each_Elective: "",
      requirements: [],
      min_semester_credits: null,
      max_semester_credits: null,
    });
    setCurrentEditTemplate(null);
    setOpenMainDialog(false);
  };

  const handleCloseRequirementDialog = () => {
    setOpenRequirementDialog(false);
    setRequirementFormData({
      id: null,
      attribute: "",
      attribute_value: null,
      attribute_choice: "",
      major: null,
      include: true,
      requirement_size: null,
      requirement_type: "",
      credit_type: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.major === "") {
      setMajorError(true);
    }
    const method = currentEditTemplate ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing field
    const url = currentEditTemplate
      ? `http://plan-of-study.cs.vt.edu:8000/api/template/${currentEditTemplate.id}/` // If editing, use the field ID
      : "http://plan-of-study.cs.vt.edu:8000/api/template/";
    handleCloseDialog();
    // axios[method](url, formData).then(getListTemplates());
    try {
      await props.checkTokenAndRefresh();
      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      NotificationManager.success(
        currentEditTemplate
          ? "Successfully Updates Template!"
          : "Successfully Added New Template!",
        "Success",
        5000
      );
      handleCloseDialog();
      getListTemplates();
    } catch (error) {
      console.error("Error submitting template data:", error);
      NotificationManager.error(
        currentEditTemplate
          ? "Error Editing Template"
          : "Error Adding New Template",
        "Error",
        5000
      );
    }
  };

  const handleSubmitRequirement = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (requirementFormData.attribute !== "") {
      if (requirementFormData.attribute_choice === "") {
        setAttributeChoiceError(true);
        return;
      }
      if (requirementFormData.attribute_value === null) {
        setAttributeValueError(true);
        return;
      }
    }
    if (requirementFormData.major === null) {
      setMajorRequirementError(true);
      return;
    }
    if (requirementFormData.credit_type === null) {
      setCreditTypeError(true);
      return;
    }

    // console.log("currentEditRequirement");
    // console.log(currentEditRequirement);

    // Fetch the existing requirements in the template
    if (currentEditTemplate) {
      // still missing call to backend for actual requirement details

      // Check if the new requirement matches an existing one within the template
      const isDuplicate =
        templateRequirements.filter(
          (req) =>
            req.attribute === requirementFormData.attribute &&
            req.attribute_value === requirementFormData.attribute_value &&
            req.attribute_choice === requirementFormData.attribute_choice &&
            req.major === requirementFormData.major &&
            req.requirement_size === requirementFormData.requirement_size &&
            req.requirement_type === requirementFormData.requirement_type &&
            req.credit_type === requirementFormData.credit_type &&
            req.id !== requirementFormData.id
        ).length === 0
          ? false
          : true;

      if (isDuplicate) {
        console.warn("This requirement already exists in the template!");
        NotificationManager.warning(
          "This requirement already exists in the template!",
          "Warning",
          5000
        );
        handleCloseRequirementDialog();
        return;
      }
    }

    const method = currentEditRequirement ? "put" : "post";
    const url = currentEditRequirement
      ? `http://plan-of-study.cs.vt.edu:8000/api/requirement/${currentEditRequirement.id}/`
      : "http://plan-of-study.cs.vt.edu:8000/api/requirement/";

    try {
      await props.checkTokenAndRefresh();
      const response = await axios[method](url, requirementFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Response");
      console.log(response);

      let newRequirementId = response.data.id;

      if (currentEditTemplate) {
        const templateResponse = await axios.get(
          `http://plan-of-study.cs.vt.edu:8000/api/template/${currentEditTemplate.id}/`
        );

        const updatedRequirements = [
          ...templateResponse.data.requirements,
          newRequirementId,
        ];

        // Update the template with the new requirement
        const newTemplateResponse = await axios.put(
          `http://plan-of-study.cs.vt.edu:8000/api/template/${currentEditTemplate.id}/`,
          {
            ...templateResponse.data,
            requirements: updatedRequirements,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        await getListTemplates();
        await fetchRequirements(newTemplateResponse.data);
        setCurrentEditTemplate(newTemplateResponse.data);
        setCurrentEditRequirement(null);
        NotificationManager.success(
          currentEditRequirement
            ? "Successfully Updates Requirement!"
            : "Successfully Added Requirement!",
          "Success",
          5000
        );
      }
      handleCloseRequirementDialog();
    } catch (error) {
      console.error("Error submitting requirement data:", error);
      NotificationManager.error(
        currentEditRequirement
          ? "Error Updates Requirement!"
          : "Error Added Requirement!",
        "Error",
        5000
      );
    }

    // Reset form data
    setRequirementFormData({
      id: null,
      attribute: "",
      attribute_value: null,
      attribute_choice: "",
      major: null,
      include: true,
      requirement_size: null,
      requirement_type: "",
      credit_type: null,
    });
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
      await props.checkTokenAndRefresh();
      await axios.delete(
        `http://plan-of-study.cs.vt.edu:8000/api/template/${template.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      handleCloseDialog();
      getListTemplates();
    } catch (error) {
      console.error("Error deleting template: ", error);
    }
  };

  const handleDeleteRequirement = async (requirement) => {
    try {
      await props.checkTokenAndRefresh();
      await axios.delete(
        `http://plan-of-study.cs.vt.edu:8000/api/requirement/${requirement.id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const newTemplate = await axios.get(
        `http://plan-of-study.cs.vt.edu:8000/api/template/${currentEditTemplate.id}`
      );
      // Fetch updated requirements list for the current template
      if (newTemplate.data) {
        await fetchRequirements(newTemplate.data);
        await getListTemplates();
      }
      handleCloseRequirementDialog();
      // getListTemplates();
    } catch (error) {
      console.error("Error deleting requirement: ", error);
    }
  };

  const handleInfoClick = (template) => {
    setOpenInfo((prevOpenInfo) =>
      prevOpenInfo === template.id ? null : template.id
    );
    setCurrentEditTemplate(template);

    fetchRequirements(template);
  };

  // Helper function to get the label for a given attribute choice
  const getComparisonLabel = (choice) => {
    return COMPARISON_CHOICES[choice] || choice; // Return the label or fallback to the original choice if not found
  };

  const handleEditClick = (template) => {
    setFormData({
      min_credits: template.min_credits ?? "",
      major: template.major ?? "",
      level: template.level ?? "",
      min_elective_fields: template.min_elective_fields ?? "",
      min_each_Elective: template.min_each_Elective ?? "",
      requirements: template.requirements ?? [],
      min_semester_credits: template.min_semester_credits
        ? template.min_semester_credits
        : 0,
      max_semester_credits: template.max_semester_credits
        ? template.max_semester_credits
        : 0,
    });
    setCurrentEditTemplate(template);
    setOpenMainDialog(true);
    setFormTitle("Edit Template");
  };

  const handleEditRequirementClick = (requirement) => {
    setRequirementFormData({
      id: requirement.id || null,
      attribute: requirement.attribute || "",
      attribute_value: requirement.attribute_value || null,
      attribute_choice: requirement.attribute_choice || "",
      major: requirement.major || null,
      include: requirement.include,
      requirement_size: requirement.requirement_size || null,
      requirement_type: requirement.requirement_type || "",
      credit_type: requirement.credit_type || null,
    });
    setCurrentEditRequirement(requirement);
    setOpenRequirementDialog(true);
  };

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      if (openMainDialog) {
        setOpenMainDialog(true);
      }
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();

        if (!props.token || localStorage.getItem("UserRole") !== "admin") {
          setOpenHome(true); // Open dialog if no token is available
        }

        // Only after token check is done, fetch the other data
        getListTemplates();
        getListMajors();
        getListCreditTypes();
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    // Run the async function
    fetchDataAfterTokenRefresh();

    // Empty dependency array ensures this only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMainDialog]);

  if (!props.token) {
    return (
      <BackToHome
        openMainDialog={openHome}
        setOpenMainDialog={setOpenHome}
        message="Please login first"
      />
    );
  }

  if (localStorage.getItem("userRole") !== "admin") {
    return (
      <BackToHome
        openMainDialog={openHome}
        setOpenMainDialog={setOpenHome}
        message="You must be an Admin user to access this page ~"
      />
    );
  }

  return (
    <div>
      <div className="course-main">
        <TemplateSearchBar
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
                  <StyledTableCell align="center">Major</StyledTableCell>
                  <StyledTableCell align="center">Level</StyledTableCell>
                  <StyledTableCell align="center">
                    Minimum Credits
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    Number of Requirements
                  </StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((template, index) => (
                    <React.Fragment key={template.id}>
                      <StyledTableRow
                        key={index}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f5f5f5" : "white", // Alternating colors: white and light grey
                        }}
                      >
                        <StyledTableCell align="center">
                          <Tooltip
                            title={
                              all_majors.find(
                                (major) => major.id === template.major
                              )?.name || "N/A"
                            }
                          >
                            <span>
                              {all_majors.find(
                                (major) => major.id === template.major
                              )?.abbreviation || "N/A"}
                            </span>
                          </Tooltip>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.level}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.min_credits}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {template.requirements.length}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Button
                            sx={{ color: "black" }}
                            onClick={() => handleEditClick(template)}
                          >
                            <AiOutlineEdit />
                          </Button>
                          <Button onClick={() => handleInfoClick(template)}>
                            <AiOutlineInfoCircle />
                          </Button>
                          <Button
                            sx={{ color: "red" }}
                            onClick={() => {
                              setDeleteConfirmation(true);
                              setDeleteConfirmationMessage(
                                "Are you sure you wan to delete this template from the database?"
                              );
                              setDeleteFunc(() => () => handleDelete(template));
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
                      <StyledTableRow style={{ backgroundColor: "#fafafa" }}>
                        <TableCell
                          colSpan={6}
                          style={{ padding: "0 0 0 20px" }}
                        >
                          <Collapse
                            in={openInfo === template.id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 1 }}>
                              <p>
                                <b>Major: </b>{" "}
                                {all_majors.find(
                                  (major) => major.id === template.major
                                )?.name || "N/A"}
                              </p>
                              <p>
                                <b>Level: </b> {template.level}
                              </p>
                              <p>
                                <b>Minimum number of Elective Fields: </b>
                                {template.min_elective_fields}
                              </p>
                              <p>
                                <b>
                                  Minimum credits of classes needed to take in
                                  each Elective Fields:{" "}
                                </b>
                                {template.min_each_Elective} credits
                              </p>
                              <p>
                                <b>
                                  Requirements ({template.requirements.length}
                                  ):{" "}
                                </b>
                                <Button
                                  className="add-requirement-button"
                                  aria-label="add"
                                  onClick={handleClickOpenRequirement}
                                  sx={{
                                    backgroundColor: "#800000",
                                    color: "#fff",
                                    "&:hover": {
                                      backgroundColor: "#600000",
                                    },
                                  }}
                                >
                                  <AddCircleOutlineIcon
                                    sx={{ width: "12.5px", height: "12.5px" }}
                                  />
                                </Button>
                              </p>
                              <b>Requirement Details:</b>
                              <ul>
                                {templateRequirements.map((req) => (
                                  <li key={req.id}>
                                    {"Courses "}
                                    <b>{req.include ? "in " : "not in "}</b>
                                    {req.major_name}
                                    {req.attribute && req.attribute !== "" ? (
                                      <>
                                        {" where "}
                                        {req.attribute.replace("_", " ")}{" "}
                                        {getComparisonLabel(
                                          req.attribute_choice
                                        )}{" "}
                                        {req.attribute_value}
                                        {"'s requirement "}
                                      </>
                                    ) : (
                                      "'s requirement "
                                    )}
                                    <b>
                                      {getComparisonLabel(req.requirement_type)}{" "}
                                      {req.requirement_size}{" "}
                                      {req.credit_type_name}
                                    </b>
                                    <Button
                                      sx={{ color: "black" }}
                                      onClick={() =>
                                        handleEditRequirementClick(req)
                                      }
                                    >
                                      <AiOutlineEdit />
                                    </Button>
                                    <Button
                                      sx={{ color: "red" }}
                                      onClick={() => {
                                        setDeleteConfirmation(true);
                                        setDeleteConfirmationMessage(
                                          "Are you sure you wan to delete this requirement from the database?"
                                        );
                                        setDeleteFunc(
                                          () => () =>
                                            handleDeleteRequirement(req)
                                        );
                                      }}
                                    >
                                      <AiOutlineDelete />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          </Collapse>
                        </TableCell>
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
      <Dialog
        fullWidth
        open={openRequirementDialog}
        onClose={handleCloseRequirementDialog}
      >
        <DialogTitle>Course Requirement</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ paddingBottom: "10px" }}>
            Please fill out the details of this requirement.
          </DialogContentText>
          <form onSubmit={handleSubmitRequirement}>
            {/* Attribute Field: Choice between "No Selection", "Course Number", "Elective Field" */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                select
                label="Attribute"
                variant="outlined"
                value={requirementFormData.attribute || ""}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    attribute: e.target.value,
                  })
                }
                fullWidth
              >
                <MenuItem value="">No Selection</MenuItem>
                <MenuItem value="course_number">Course Number</MenuItem>
                <MenuItem value="elective_field">Elective Field</MenuItem>
              </TextField>
            </div>

            {/* Attribute Choice Field */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                select
                label={
                  requirementFormData.attribute !== ""
                    ? "Attribute Choice *"
                    : "Attribute Choice"
                }
                variant="outlined"
                value={requirementFormData.attribute_choice}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    attribute_choice: e.target.value,
                  })
                }
                fullWidth
                error={attributeChoiceError}
                helperText={
                  attributeChoiceError
                    ? "Please select an attribute choice"
                    : ""
                }
              >
                {Object.entries(COMPARISON_CHOICES).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {/* Attribute Value Field */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                label={
                  requirementFormData.attribute !== ""
                    ? "Attribute Value *"
                    : "Attribute Value"
                }
                variant="outlined"
                // Show an empty string if attribute_value is null, otherwise display the actual value
                value={
                  requirementFormData.attribute_value === null
                    ? ""
                    : requirementFormData.attribute_value
                }
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    // Set attribute_value to null if the field is empty, otherwise use the inputted number
                    attribute_value:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                error={attributeValueError}
                helperText={
                  attributeValueError
                    ? "Please select an attribute choice value error"
                    : ""
                }
                fullWidth
              />
            </div>

            {/* Include Toggle Field */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!requirementFormData.include}
                    onChange={(e) =>
                      setRequirementFormData({
                        ...requirementFormData,
                        include: !e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Exclude Major"
              />
            </div>

            {/* Major Field: Autocomplete with Major Options */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <Autocomplete
                options={all_majors} // Array of major options
                getOptionLabel={(option) => option.name} // Display the major's name
                value={
                  all_majors.find(
                    (major) => major.id === requirementFormData.major
                  ) || null
                }
                onChange={(e, newValue) => {
                  setRequirementFormData({
                    ...requirementFormData,
                    major: newValue ? newValue.id : null,
                  });
                  setMajorRequirementError(false);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Major *"
                    variant="outlined"
                    fullWidth
                    error={majorRequirementError}
                    helperText={
                      majorRequirementError ? "Please select a major" : ""
                    }
                  />
                )}
              />
            </div>

            {/* Requirement Type Field */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                select
                label="Requirement Type"
                variant="outlined"
                value={requirementFormData.requirement_type}
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    requirement_type: e.target.value,
                  })
                }
                fullWidth
              >
                {Object.entries(COMPARISON_CHOICES).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {/* Requirement Size Field */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                label="Requirement Size"
                variant="outlined"
                value={
                  requirementFormData.requirement_size === null
                    ? ""
                    : requirementFormData.requirement_size
                }
                onChange={(e) =>
                  setRequirementFormData({
                    ...requirementFormData,
                    requirement_size:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                fullWidth
              />
            </div>

            {/* Credit Type Field: Dropdown for Credit Type Options */}
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <Autocomplete
                options={all_credit_types} // Array of credit type options
                getOptionLabel={(option) => option.name} // Display the credit type's name
                value={
                  all_credit_types.find(
                    (creditType) =>
                      creditType.id === requirementFormData.credit_type
                  ) || null
                }
                onChange={(e, newValue) => {
                  setRequirementFormData({
                    ...requirementFormData,
                    credit_type: newValue ? newValue.id : null,
                  });
                  setCreditTypeError(false);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Credit Type *"
                    variant="outlined"
                    fullWidth
                    error={creditTypeError}
                    helperText={
                      creditTypeError ? "Please choose a credit type" : ""
                    }
                  />
                )}
              />
            </div>

            <DialogActions>
              <Button onClick={handleCloseRequirementDialog}>Cancel</Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog fullWidth open={openMainDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>{formTitle}</div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <Autocomplete
                options={all_majors} // Array of major options
                getOptionLabel={(option) => option.name} // Display the major's name
                value={
                  all_majors.find((major) => major.id === formData.major) ||
                  null
                } // Show selected major
                onChange={handleChangeMajor} // Handle change for single selection
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
                sx={{ width: "100%" }} // Full width
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_credits"
                label="Minimum Credits"
                type="text"
                className="input_textfield"
                value={formData.min_credits || ""}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="level"
                label="Level"
                type="text"
                className="input_textfield"
                value={formData.level || ""}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_elective_fields"
                label="Minimum Number of Elective Fields to Take"
                type="text"
                className="input_textfield"
                value={formData.min_elective_fields || ""}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_each_Elective"
                label="Minimum credits of Each Elective Fields to Take"
                type="text"
                className="input_textfield"
                value={formData.min_each_Elective || ""}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="min_semester_credits"
                label="Minimum Semester Credits"
                type="number"
                className="input_textfield"
                value={formData.min_semester_credits || 0}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <TextField
                required
                autoFocus
                margin="dense"
                id="max_semester_credits"
                label="Maximum Semester Credits"
                type="number"
                className="input_textfield"
                value={formData.max_semester_credits || 0}
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
    </div>
  );
};

export default Template;
