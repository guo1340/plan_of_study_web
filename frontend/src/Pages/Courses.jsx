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

const Courses = () => {
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    major: "",
    abbreviation: "",
    title: "",
    prereqs: [],
    term: "",
    coreqs: [],
    description: "",
    credits: "",
    elective_field: -1,
    elective_field_name: "",
    editable_credits: false,
  });

  const elective_fields = [
    { num: 0, name: "Ethics and Research Methods" },
    { num: 1, name: "Algorithms and Theory" },
    { num: 2, name: "Computer Systems" },
    { num: 3, name: "Programming Languages" },
    { num: 4, name: "Numerical and Scientific Computing" },
    { num: 5, name: "Computer Architecture and Networking" },
    { num: 6, name: "Data and Information" },
    { num: 7, name: "Software Engineering" },
    { num: 8, name: "Human-Computer Interaction" },
    { num: 9, name: "Intelligent Systems" },
    { num: 10, name: "Computational Biology and Bioinformatics" },
  ];

  const handleClose = () => {
    setFormData({
      major: "",
      abbreviation: "",
      title: "",
      prereqs: [],
      term: "",
      coreqs: [],
      description: "",
      credits: "",
      elective_field: -1,
      elective_field_name: "",
      editable_credits: false,
    });
    setOpenDialog(false);
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
    console.log(formData);
    axios
      .post("http://localhost:8000/api/classes/", formData)
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
      term: "",
      coreqs: [],
      description: "",
      credits: "",
      elective_field: -1,
      elective_field_name: "",
      editable_credits: false,
    });
    setOpenDialog(false);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/classes/")
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
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

  return (
    <div style={{ padding: "25px" }}>
      <Button
        variant="contained"
        size="medium"
        style={{ marginBottom: "20px", float: "right" }}
        onClick={handleClickOpen}
      >
        Add
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
              <TextField
                required
                autoFocus
                margin="dense"
                id="term"
                label="Offered Term(s)"
                type="text"
                className="input_textfield"
                value={formData.term}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Corequisite</div>
              {/* <TextField
                required
                autoFocus
                margin="dense"
                id="coreq"
                label="Corequisite"
                type="text"
                className="input_textfield"
                value={formData.coreq}
                onChange={handleChange}
                fullWidth
              /> */}
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
              {/* <TextField
                id="elective_field_num"
                required
                fullWidth
                select
                label="Select"
                helperText="Please select the course's elective field"
                onChange={(event) => {
                  const selectedNum = event.target.value;
                  const selectedField = elective_fields.find(
                    (option) => option.num === parseInt(selectedNum)
                  );
                  setFormData({
                    ...formData,
                    elective_field: selectedNum,
                    elective_field_name: selectedField
                      ? selectedField.name
                      : "",
                  });
                }}
              >
                {elective_fields.map((field) => (
                  <MenuItem key={field.num} value={field.num}>
                    {"Area " + field.num + ": " + field.name}
                  </MenuItem>
                ))}
              </TextField> */}
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Course Name</StyledTableCell>
              <StyledTableCell align="center">Full Name</StyledTableCell>
              <StyledTableCell align="center">Major</StyledTableCell>
              <StyledTableCell align="center">Term</StyledTableCell>
              <StyledTableCell align="center">Credits</StyledTableCell>
              <StyledTableCell align="center">Elective Field</StyledTableCell>
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
                <StyledTableCell align="center">{row.term}</StyledTableCell>
                <StyledTableCell align="center">{row.credits}</StyledTableCell>
                <StyledTableCell align="center">
                  {"Area " +
                    row.elective_field +
                    ": " +
                    row.elective_field_name}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Courses;
