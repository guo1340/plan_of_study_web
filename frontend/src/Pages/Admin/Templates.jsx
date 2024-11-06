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

const TemplateTest = () => {
  const [templates, setTemplates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
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

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  }));

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
  };

  useEffect(() => {
    getListTemplates();
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
                {templates.map((template, index) => (
                  <TableRow key={index}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Main>

        <Dialog fullWidth open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            <div style={{ fontSize: "35px" }}>Add Elective Template</div>
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
        </Drawer>
      </Box>
    </div>
  );
};

export default TemplateTest;
