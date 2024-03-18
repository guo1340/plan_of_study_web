import React, { useState } from "react";
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

  const elective_fields = [
    {
      num: 0,
      name: "Ethics and Research Methods",
    },
    {
      num: 1,
      name: "Algorithms and Theory",
    },
    {
      num: 2,
      name: "Computer Systems",
    },
    {
      num: 3,
      name: "Programming Languages",
    },
    {
      num: 4,
      name: "Numerical and Scientific Computing",
    },
    {
      num: 5,
      name: "Computer Architecture and Networking",
    },
    {
      num: 6,
      name: "Data and Information",
    },
    {
      num: 7,
      name: "Software Engineering",
    },
    {
      num: 8,
      name: "Human-Computer Interaction",
    },
    {
      num: 9,
      name: "Intelligent Systems",
    },
    {
      num: 10,
      name: "Computational Biology and Bioinformatics",
    },
  ];

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    const courseData = {};

    // Retrieve values from each text field and populate the object
    const major = document.getElementById("major").value;
    const abbreviation = document.getElementById("class_abbr").value;
    const title = document.getElementById("title").value;
    const prereq = document.getElementById("prerequisite").value;
    const term = document.getElementById("offered_term").value;
    const coreq = document.getElementById("corequisite").value;
    const description = document.getElementById("description").value;
    // const editable_credits = document.getElementById(
    //   "credit_editable_switch"
    // ).checked;
    const credits = document.getElementById("number").value;
    // console.log(document.getElementById("number"));
    // const elective_field = document.getElementById("elective_field_num").value;
    // const isCreditEditableElement = document.getElementById(
    //   "credit_editable_switch"
    // );
    // const editable_credits = isCreditEditableElement
    //   ? isCreditEditableElement.checked
    //   : false;

    courseData.major = major;
    courseData.abbreviation = abbreviation;
    courseData.title = title;
    courseData.prereq = prereq;
    courseData.term = term;
    courseData.coreq = coreq;
    courseData.description = description;
    // courseData.editable_credits = editable_credits;
    courseData.credits = credits;
    // courseData.elective_field = elective_field;

    // Log or send the object wherever necessary
    console.log(courseData);
  };

  React.useEffect(() => {
    axios
      .get("http://localhost:8000/api/classes/")
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Class Abbreviation</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="class_abbr"
                label="Class Abbreviation"
                type="text"
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
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
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Prerequisite</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="prerequisite"
                label="Prerequisite"
                type="text"
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Offered Term(s)</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="offered_term"
                label="Offered Term(s)"
                type="text"
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
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
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Corequisite</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="corequisite"
                label="Corequisite"
                type="text"
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
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
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
            </div>
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Number</div>
              <TextField
                required
                autoFocus
                margin="dense"
                id="number"
                label="Number"
                type="text"
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
                fullWidth
              />
            </div>
            {/* <TextField
              autoFocus
              margin="dense"
              id="editable_credits"
              label="Is Credit Editable"
              type="text"
               
            /> */}
            <div>Is Credit Editable</div>
            <FormControlLabel control={<Switch />} />
            <div style={{ paddingTop: "5px", paddingBottom: "10px" }}>
              <div>Elective Field</div>
              <TextField
                required
                autoFocus
                select
                margin="dense"
                id="elective_field_num"
                label="Elective Field Number"
                type="text"
                fullWidth
                style={{
                  paddingRight: "20px",
                  paddingBottom: "10px",
                }}
              >
                {elective_fields.map((option) => (
                  <MenuItem key={option.num} value={option.num}>
                    {"Area " + option.num + ": " + option.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Course Name</StyledTableCell>
              <StyledTableCell align="center">Major</StyledTableCell>
              <StyledTableCell align="center">Pre-requisite</StyledTableCell>
              <StyledTableCell align="center">Term</StyledTableCell>
              <StyledTableCell align="center">Co-requisite</StyledTableCell>
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
                <StyledTableCell align="center">{row.major}</StyledTableCell>
                <StyledTableCell align="center">{row.prereq}</StyledTableCell>
                <StyledTableCell align="center">{row.term}</StyledTableCell>
                <StyledTableCell align="center">{row.coreq}</StyledTableCell>
                <StyledTableCell align="center">{row.credits}</StyledTableCell>
                <StyledTableCell align="center">
                  {row.elective_field_name}
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
