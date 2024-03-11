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

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
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
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Add Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please fill out the details of the new course.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="major"
            label="Major"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="class_abbr"
            label="Class Abbreviation"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Class Title"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="prerequisite"
            label="Prerequisite"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="offered_term"
            label="Offered Term(s)"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="major"
            label="Major"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="corequisite"
            label="Corequisite"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="cedit"
            label="Credits"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="editable_credits"
            label="Is Credit Editable"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="elective_field_num"
            label="Elective Field Number"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="elective_field_name"
            label="Elective Field Name"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} color="primary">
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
