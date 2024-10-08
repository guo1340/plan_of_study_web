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
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import React, { useState, useEffect } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const ElectiveFieldTest = () => {
  const [elective_fields, setFields] = useState([]);
  const [majors, setMajors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type_name: "",
    major: "",
    field_name: "",
    field_number: "",
  });
  const [currentEditField, setCurrentEditField] = useState(null); // state variable to hold the field being edited
  const [openDrawer, setOpenDrawer] = useState(false);

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  }));

  const getlistMajors = () => {
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

  const getListFields = () => {
    axios
      .get("http://localhost:8000/api/elective-field/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setFields(res.data);
      })
      .catch((error) => {
        console.error("Error fetching elective fields data:", error);
      });
  };
  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };
  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
    setCurrentEditField(null);
  };
  const handleCloseDialog = () => {
    setFormData({ type_name: "", major: "", field_name: "", field_number: "" });
    setOpenDialog(false);
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const method = currentEditField ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing field
  // const url = currentEditField
  //   ? `http://localhost:8000/api/elective-field/${currentEditField.id}/` // If editing, use the field ID
  //   : "http://localhost:8000/api/elective-field/";
  //   console.log(formData);
  //   handleCloseDialog();
  //   // axios[method](url, formData).then(getListFields());
  //   try {
  //     await axios[method](url, formData, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //       },
  //     });
  //     handleCloseDialog();
  //     getListFields();
  //   } catch (error) {
  //     console.error("Error submitting elective field data:", error);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentEditField ? "put" : "post"; // Determine the HTTP method for elective field
    const url = currentEditField
      ? `http://localhost:8000/api/elective-field/${currentEditField.id}/` // If editing, use the field ID
      : "http://localhost:8000/api/elective-field/";

    try {
      // Step 1: Create or update the elective field
      const electiveFieldResponse = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // Step 2: Update the Template with the same major
      const major = formData.major; // Get the major from formData
      if (major) {
        // Fetch the Template that has the same major
        const templateResponse = await axios.get(
          `http://localhost:8000/api/template/?major=${major}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const template = templateResponse.data[0]; // Assuming only one template matches the major
        if (template) {
          // Step 3: Add the new elective field to the template (assuming elective_fields is a ManyToMany relation)
          await axios.put(
            `http://localhost:8000/api/template/${template.id}/`,
            {
              ...template, // Spread the current template data
              elective_fields: [
                ...template.elective_fields,
                electiveFieldResponse.data.id,
              ], // Add the new elective field
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
        }
      }

      // Step 4: Handle closing dialog and refreshing data
      handleCloseDialog();
      getListFields();
    } catch (error) {
      console.error(
        "Error submitting elective field data or updating template:",
        error
      );
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeMajor = (e) => {
    const { name, value } = e.target; // Use 'name' instead of 'id'
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Update with the selected value directly
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

  const handleInfo = (field) => {
    // event handler for the info button
    if (!openDrawer || currentEditField.id === field.id) {
      toggleDrawer();
    }
    setCurrentEditField(field);
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
    getListFields();
    getlistMajors();
  }, []);

  return (
    <div style={{ padding: "25px" }}>
      <Box sx={{ display: "flex" }}>
        {/* main display table below */}
        <Main open={openDrawer}>
          {/* <DrawerHeader /> */}
          {/* add button that opens a dialog */}
          <Button variant="contained" color="primary" onClick={toggleDialog}>
            +
          </Button>
          <TableContainer>
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
                  <TableRow key={index}>
                    <StyledTableCell align="center">
                      {field.type_name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.major}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.field_name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.field_number}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button>
                        <AiOutlineEdit onClick={() => handleEditClick(field)} />
                      </Button>
                      <Button onClick={() => handleInfo(field)}>
                        <AiOutlineInfoCircle />
                      </Button>
                      <Button onClick={() => handleDelete(field)}>
                        <AiOutlineDelete />
                      </Button>
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Main>

        <Dialog fullWidth open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            <div style={{ fontSize: "35px" }}>Add Elective Field</div>
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
        <Drawer
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
            {currentEditField && (
              <div>
                <h2>Field Info</h2>
                <p>
                  <b>Type Name:</b> {currentEditField.type_name}
                </p>
                <p>
                  <b>Major:</b> {currentEditField.major}
                </p>
                <p>
                  <b>Field Name:</b> {currentEditField.field_name}
                </p>
                <p>
                  <b>Field Number:</b> {currentEditField.field_number}
                </p>
              </div>
            )}
          </div>
        </Drawer>
      </Box>
    </div>
  );
};

export default ElectiveFieldTest;
