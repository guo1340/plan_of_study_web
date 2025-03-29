import React, {useState, useEffect} from "react";
import axios from "axios";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import Autocomplete from "@mui/material/Autocomplete";
import {styled} from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, {tableCellClasses} from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import {
    AiOutlineEdit,
    AiOutlineInfoCircle,
    AiOutlineDelete,
} from "react-icons/ai";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {useTheme} from "@mui/material/styles";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";
import CourseSearchBar from "../Components/Courses/CourseSearchbar";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {NotificationManager} from "react-notifications";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#800000",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    "&:nth-of-type(4n+1)": {
        backgroundColor: theme.palette.action.hover,
    },
    // Hide last border
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

const TablePaginationActions = (props) => {
    const theme = useTheme();
    const {count, page, rowsPerPage, onPageChange} = props;

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
        <Box sx={{flexShrink: 0, ml: 2.5}}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === "rtl" ? <LastPageIcon/> : <FirstPageIcon/>}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowRight/>
                ) : (
                    <KeyboardArrowLeft/>
                )}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft/>
                ) : (
                    <KeyboardArrowRight/>
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === "rtl" ? <FirstPageIcon/> : <LastPageIcon/>}
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

const Courses = (props) => {
    const [classes, setClasses] = useState([]);
    const [currentEditCourse, setCurrentEditCourse] = useState(null); // state variable to hold the course being edited
    const [openInfo, setOpenInfo] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        major: null,
        class_number: null,
        title: "",
        prereqs: [[]],
        seasons: [],
        coreqs: [[]],
        description: "",
        credits: null,
        elective_field: null,
        editable_credits: false,
        credit_type: null,
        link: "",
    });

    const [planSelectForm, setPlanSelectForm] = useState({
        plan: null,
        course: null,
    });

    const [majors, setMajors] = useState([]);
    const [form_elective_fields, setFormElectiveFields] = useState([]);
    const [electiveFieldList, setElectiveFieldList] = useState([]);
    const [creditTypes, setCreditTypes] = useState([]);
    const [all_seasons, setSeasons] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [formTitle, setFormTitle] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [seasonError, setSeasonError] = useState(false);
    const [electiveError, setElectiveError] = useState(false);
    const [creditTypeError, setCreditTypeError] = useState(false);
    const [planList, setPlanList] = useState([]);
    const [openAddToPlanDialog, setOpenAddToPlanDialog] = useState(false);

    const handleEditClick = async (course) => {
        // Set the form data to the values from the course to be edited
        setFormData({
            major: course.major,
            abbreviation: course.abbreviation,
            class_number: course.class_number,
            title: course.title,
            prereqs: Array.isArray(course.prereq_groups) && course.prereq_groups.length > 0
                ? course.prereq_groups.map((group) => Array.isArray(group) ? group : [])
                : [[]],
            seasons: course.seasons,
            coreqs: Array.isArray(course.coreq_groups) && course.coreq_groups.length > 0
                ? course.coreq_groups.map((group) => Array.isArray(group) ? group : [])
                : [[]],
            description: course.description,
            credits: course.credits,
            elective_field: course.elective_field,
            editable_credits: course.editable_credits,
            credit_type: course.credit_type,
            link: course.link,
        });
        try {
            const response = await axios.get(
                `http://localhost:8000/api/elective-field/`,
                {
                    params: {major: course.major}, // Pass the selected major as a query parameter
                }
            );
            const electiveFields = response.data.sort(
                (a, b) => a.field_number - b.field_number
            );

            // Set the elective fields for the selected major in the state
            setFormElectiveFields(electiveFields);
        } catch (error) {
            console.error("Error fetching elective fields:", error);
        }
        setFormTitle("Edit Course");
        setCurrentEditCourse(course); // Save the current course being edited
        setOpenDialog(true); // Open the dialog form
    };

    const getListMajors = () => {
        axios
            .get("http://localhost:8000/api/major/")
            .then((res) => {
                setMajors(res.data);
            })
            .catch((error) => {
                console.error("Error fetching major data:", error);
            });
    };

    const getListCourses = async () => {
        try {
            const courseResponse = await axios.get(
                "http://localhost:8000/api/classes/"
            );
            const coursesData = courseResponse.data;

            const coursesWithElectiveFields = await Promise.all(
                coursesData.map(async (course) => {
                    try {
                        const electiveFieldResponse = await axios.get(
                            `http://localhost:8000/api/elective-field/${course.elective_field}`
                        );
                        let courseSeasons = [];
                        course.seasons.map(async (season) => {
                            const seasonResponse = await axios.get(
                                `http://localhost:8000/api/season/${season}`
                            );
                            courseSeasons.push(seasonResponse.data);
                        });
                        let coursePrereqs = [];
                        const prereqIds = course.prereq_groups?.flat() || [];
                        await Promise.all(
                            prereqIds.map(async (prereqId) => {
                                try {
                                    const prereqResponse = await axios.get(
                                        `http://localhost:8000/api/classes/${prereqId}`
                                    );
                                    coursePrereqs.push(prereqResponse.data);
                                } catch (err) {
                                    console.error("Failed to fetch prereq course:", prereqId, err);
                                }
                            })
                        );

                        let courseCoreqs = [];
                        const coreqIds = course.coreq_groups?.flat() || [];
                        await Promise.all(
                            coreqIds.map(async (coreqId) => {
                                try {
                                    const coreqResponse = await axios.get(
                                        `http://localhost:8000/api/classes/${coreqId}`
                                    );
                                    courseCoreqs.push(coreqResponse.data);
                                } catch (err) {
                                    console.error("Failed to fetch coreq course:", coreqId, err);
                                }
                            })
                        );
                        course.coreq_objects = courseCoreqs;


                        const electiveFieldData = electiveFieldResponse.data;

                        // Assign the elective field object to the course
                        course.elective_field_object = electiveFieldData;
                        course.season_objects = courseSeasons;
                        course.prereq_objects = coursePrereqs;
                        course.coreq_objects = courseCoreqs;
                        return course;
                    } catch (error) {
                        console.error(
                            "Error fetching elective field for course:",
                            course.id,
                            error
                        );
                        return course;
                    }
                })
            );

            setClasses(coursesWithElectiveFields);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const getListSeasons = () => {
        axios
            .get("http://localhost:8000/api/season/")
            .then((res) => {
                setSeasons(res.data);
            })
            .catch((error) => {
                console.error("Error fetching seasons data:", error);
            });
    };

    const getListCreditTypes = () => {
        axios
            .get("http://localhost:8000/api/credit-type/")
            .then((res) => {
                setCreditTypes(res.data);
            })
            .catch((error) => {
                console.error("Error fetching credit types data:", error);
            });
    };

    const getListElectiveFields = async () => {
        axios
            .get("http://localhost:8000/api/elective-field/")
            .then((res) => {
                setElectiveFieldList(res.data);
            })
            .catch((error) => {
                console.error("Error fetching elective fields data:", error);
            });
    };

    const getListPlans = async () => {
        if (!props.token) {
            return;
        }
        try {
            const response = await axios.get("http://localhost:8000/api/plan/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setPlanList(response.data);
            // console.log(planList);
        } catch (error) {
            console.error("Error fetching plans data", error);
        }
    };

    const handleInfoClick = (courseId) => {
        setOpenInfo(openInfo === courseId ? null : courseId); // Toggle the collapse for the clicked course
    };

    const handleDelete = async (course) => {
        // event handler for the delete button
        await props.checkTokenAndRefresh();
        axios
            .delete(`http://localhost:8000/api/classes/${course.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            })
            .then(() => {
                getListCourses();
            })
            .catch((err) => {
                console.log("Error deleting course: ", err);
            });
    };

    const handleClose = () => {
        setFormData({
            major: -1,
            abbreviation: "",
            title: "",
            prereqs: [[]],
            seasons: [],
            coreqs: [[]],
            description: "",
            credits: "",
            elective_field: -1,
            editable_credits: false,
            credit_type: -1,
        });
        setFormElectiveFields([]);
        setOpenDialog(false);
        // Reset form data and close the dialog
        setCurrentEditCourse(null);
    };

    const handleCloseAddToPlan = () => {
        setPlanSelectForm({
            plan: null,
        });
        setOpenAddToPlanDialog(false);
        setCurrentEditCourse(null);
    };

    const handleClickOpen = () => {
        setOpenDialog(true);
        setFormTitle("Add Course");
    };

    const handleChange = (e) => {
        const {id, value, type, checked} = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.seasons.length === 0) {
            setSeasonError(true);
        } else if (formData.elective_field === -1) {
            setElectiveError(true);
        } else {
            const method = currentEditCourse ? "put" : "post"; // Determine the HTTP method and URL based on whether you're editing an existing course
            const url = currentEditCourse
                ? `http://localhost:8000/api/classes/${currentEditCourse.id}/` // If editing, use the course ID
                : "http://localhost:8000/api/classes/";
            // console.log(formData);
            await props.checkTokenAndRefresh();
            const formDataToSubmit = {
                ...formData,
                prereq_groups: formData.prereqs, // Rename key
                coreq_groups: formData.coreqs, // 👈 NEW
            };
            delete formDataToSubmit.prereqs;
            delete formDataToSubmit.coreqs;
            await axios[method](url, formDataToSubmit, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            getListCourses();
            setFormData({
                major: -1,
                abbreviation: "",
                title: "",
                prereqs: [[]],
                seasons: [],
                coreqs: [[]],
                description: "",
                credits: "",
                elective_field: -1,
                editable_credits: false,
                credit_type: -1,
            });
            setOpenDialog(false);
            handleClose();
        }
    };

    useEffect(() => {
        const fetchDataAfterTokenRefresh = async () => {
            try {
                // Wait for checkTokenAndRefresh to finish
                await props.checkTokenAndRefresh();

                // Only after token check is done, fetch the other data
                await getListMajors();
                await getListCourses();
                await getListSeasons();
                await getListCreditTypes();
                await getListElectiveFields();
                await getListPlans();
                // console.log(majors);
            } catch (error) {
                console.error("Error in token refresh or data fetching:", error);
            }
        };

        // Run the async function
        fetchDataAfterTokenRefresh();

        // Empty dependency array ensures this only runs once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const class_options = classes.map((cls) => {
        const major = majors.find((major) => major.id === cls.major); // Find major abbreviation
        return {
            value: cls.id,
            label: `${major?.abbreviation || "N/A"} ${cls.class_number} - ${cls.title}`, // Updated label
        };
    });

    // Handling change for MUI Select (adjusted for multi-select) for prereqs
    const handlePrereqsChange = (event, newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            prereqs: newValue ? newValue.map((option) => [option.value]) : [],
        }));
    };

    // Handling change for MUI Select for coreqs
    const handleCoreqsChange = (event, newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            coreqs: newValue ? newValue.map((option) => option.value) : [], // Ensure coreqs is always an array
        }));
    };

    const handleChangeMajor = async (e, newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            major: newValue ? newValue.id : -1, // Update formData with the selected major or set to empty string
        }));

        // Fetch elective fields for the selected major
        try {
            const response = await axios.get(
                `http://localhost:8000/api/elective-field/?search={"major":"${newValue.id}"}`
            );
            const electiveFields = response.data.sort(
                (a, b) => a.field_number - b.field_number
            );

            // Set the elective fields for the selected major in the state
            setFormElectiveFields(electiveFields);
        } catch (error) {
            console.error("Error fetching elective fields:", error);
        }
    };

    const handleChangeElectiveField = (event, newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            elective_field: newValue ? newValue.id : -1, // Update elective field ID, or -1 if none selected
        }));
        setElectiveError(false);
    };

    const handleChangeSeason = (event, newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            seasons: newValue ? newValue.map((option) => option.id) : [], // Ensure coreqs is always an array
        }));
        setSeasonError(false);
    };

    const handleChangeCreditType = (event, newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            credit_type: newValue ? newValue.id : -1, // Ensure coreqs is always an array
        }));
        setCreditTypeError(false);
    };

    const enrichCourseData = async (coursesData) => {
        return await Promise.all(
            coursesData.map(async (course) => {
                try {
                    const electiveFieldResponse = await axios.get(
                        `http://localhost:8000/api/elective-field/${course.elective_field}`
                    );

                    let courseSeasons = [];
                    await Promise.all(
                        course.seasons.map(async (season) => {
                            const seasonResponse = await axios.get(
                                `http://localhost:8000/api/season/${season}`
                            );
                            courseSeasons.push(seasonResponse.data);
                        })
                    );

                    let coursePrereqs = [];
                    const prereqIds = course.prereq_groups?.flat() || [];
                    await Promise.all(
                        prereqIds.map(async (prereqId) => {
                            const prereqResponse = await axios.get(
                                `http://localhost:8000/api/classes/${prereqId}`
                            );
                            coursePrereqs.push(prereqResponse.data);
                        })
                    );

                    let courseCoreqs = [];
                    const coreqIds = course.coreq_groups?.flat() || [];
                    await Promise.all(
                        coreqIds.map(async (coreqId) => {
                            const coreqResponse = await axios.get(
                                `http://localhost:8000/api/classes/${coreqId}`
                            );
                            courseCoreqs.push(coreqResponse.data);
                        })
                    );

                    return {
                        ...course,
                        elective_field_object: electiveFieldResponse.data,
                        season_objects: courseSeasons,
                        prereq_objects: coursePrereqs,
                        coreq_objects: courseCoreqs,
                    };
                } catch (error) {
                    console.error("Error enriching course:", course.id, error);
                    return course;
                }
            })
        );
    };


    return (
        <div>
            <Dialog
                fullWidth
                open={openAddToPlanDialog}
                onClose={handleCloseAddToPlan}
            >
                <DialogTitle>
                    <div style={{fontSize: "35px"}}>
                        Choose Plan to Add Current Course
                    </div>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText style={{paddingBottom: "10px"}}>
                        Please select the plan you would like to add the course to.
                    </DialogContentText>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault(); // Prevent default form submission behavior
                            await props.checkTokenAndRefresh();
                            try {
                                console.log(planSelectForm);

                                // ✅ Step 1: Fetch the latest `course_id_list` from the backend
                                let latestCourseIdList = [];
                                try {
                                    const courseResponse = await axios.get(
                                        `http://localhost:8000/api/classes/${planSelectForm.course.id}/`,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                            },
                                        }
                                    );
                                    latestCourseIdList = courseResponse.data.course_id_list || [];
                                } catch (error) {
                                    console.error("Error fetching latest course_id_list:", error);
                                    return;
                                }

                                // ✅ Step 2: Generate a new unique `course_id`
                                const existingCourseIds = new Set(latestCourseIdList);
                                let newCourseId = Math.floor(Math.random() * 100000); // Generate a random ID
                                while (existingCourseIds.has(newCourseId)) {
                                    newCourseId = Math.floor(Math.random() * 100000);
                                }

                                // ✅ Step 3: Create a new course object with the generated `course_id`
                                const newCourseObject = {
                                    ...planSelectForm.course,
                                    course_id: newCourseId, // Assign the newly generated ID
                                };

                                // ✅ Step 4: Update the backend `course_id_list` with the latest version
                                try {
                                    await axios.put(
                                        `http://localhost:8000/api/classes/${planSelectForm.course.id}/`,
                                        {
                                            course_id_list: [...latestCourseIdList, newCourseId], // ✅ Use the latest list
                                        },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                            },
                                        }
                                    );
                                } catch (error) {
                                    console.error("Error updating course_id_list:", error);
                                    return;
                                }

                                // ✅ Step 5: Fetch the latest `course_cart` from the backend
                                let latestCourseCart = [];
                                try {
                                    const planResponse = await axios.get(
                                        `http://localhost:8000/api/plan/${planSelectForm.plan.id}/`,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                            },
                                        }
                                    );
                                    latestCourseCart = planResponse.data.course_cart || [];
                                } catch (error) {
                                    console.error("Error fetching latest course_cart:", error);
                                    return;
                                }

                                // ✅ Step 6: Add the new course to the latest `course_cart`
                                const updatedCourseCart = [...latestCourseCart, newCourseObject];

                                // ✅ Step 7: Update the plan with the new `course_cart`
                                await axios.put(
                                    `http://localhost:8000/api/plan/${planSelectForm.plan.id}/`,
                                    {
                                        course_cart: updatedCourseCart, // ✅ Use latest `course_cart`
                                        template: planSelectForm.plan.template,
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                        },
                                    }
                                );

                                NotificationManager.success("Course added to plan successfully", "Success", 5000);
                                handleCloseAddToPlan();
                            } catch (error) {
                                console.log("Failed to add course to plan:", error);
                            }
                        }}
                    >
                        <div className="form-input-title">
                            <Autocomplete
                                disablePortal
                                options={planList} // ✅ Array of plan options
                                getOptionLabel={(option) => option.name} // ✅ Display plan name in dropdown
                                value={
                                    planList.find(
                                        (plan) => plan.id === planSelectForm.plan?.id
                                    ) || null
                                } // ✅ Handle controlled value
                                onChange={(event, newValue) => {
                                    setPlanSelectForm((prev) => ({
                                        ...prev,
                                        plan: newValue ? newValue : null,
                                    }));
                                    // console.log(planSelectForm);
                                }}
                                sx={{width: "100%"}}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Plan *"
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                        <DialogActions>
                            <Button onClick={handleCloseAddToPlan}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog fullWidth open={openDialog} onClose={handleClose}>
                <DialogTitle>
                    <div style={{fontSize: "35px"}}>{formTitle}</div>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText style={{paddingBottom: "10px"}}>
                        Please fill out the details of this course.
                    </DialogContentText>
                    <form onSubmit={handleSubmit}>
                        <div className="form-input-title">
                            <Autocomplete
                                disablePortal
                                options={majors} // Array of major options
                                getOptionLabel={(option) => option.name} // Extract major from the object
                                value={
                                    majors.find((major) => major.id === formData.major) || null
                                } // Handle controlled value
                                // onChange={handleChangeMajor} // Handle change
                                onChange={handleChangeMajor}
                                sx={{width: "100%"}} // Set width to full
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Major *"
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
                            <TextField
                                required
                                autoFocus
                                margin="dense"
                                id="class_number"
                                label="Class Number"
                                type="text"
                                className="input_textfield"
                                value={formData.class_number}
                                onChange={handleChange}
                                fullWidth
                            />
                        </div>
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
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
                        {(Array.isArray(formData.prereqs) ? formData.prereqs : []).map((group, groupIndex) => (
                            <div key={groupIndex} style={{ marginBottom: "10px" }}>
                                <Autocomplete
                                    multiple
                                    options={class_options}
                                    getOptionLabel={(option) => option.label}
                                    value={Array.isArray(group)? group
                                        .map((id) => class_options.find((option) => option.value === id))
                                        .filter(Boolean):[]}
                                    onChange={(e, newValue) => {
                                        const updatedGroups = [...formData.prereqs];
                                        updatedGroups[groupIndex] = newValue.map((option) => option.value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            prereqs: updatedGroups,
                                        }));
                                    }}
                                    disableCloseOnSelect
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.label}
                                        </li>
                                    )}
                                    renderTags={(selectedOptions, getTagProps) =>
                                        selectedOptions.map((option, index) => (
                                            <Chip key={option.value} label={option.label} {...getTagProps({ index })} />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label={`Prerequisite Group ${groupIndex + 1}`} variant="outlined" fullWidth />
                                    )}
                                />
                            </div>
                        ))}
                        <Button
                            variant="contained"
                            sx={{marginBottom:"15px"}}

                            // fullWidth
                            onClick={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    prereqs: [...prev.prereqs, []], // add a new group
                                }));
                            }}
                        >
                            + Add Prerequisite Group
                        </Button>

                        {(Array.isArray(formData.coreqs) ? formData.coreqs : []).map((group, groupIndex) => (
                            <div key={groupIndex} style={{ marginBottom: "10px" }}>
                                <Autocomplete
                                    multiple
                                    options={class_options}
                                    getOptionLabel={(option) => option.label}
                                    value={Array.isArray(group) ? group
                                        .map((id) => class_options.find((option) => option.value === id))
                                        .filter(Boolean) : []}
                                    onChange={(e, newValue) => {
                                        const updatedGroups = [...formData.coreqs];
                                        updatedGroups[groupIndex] = newValue.map((option) => option.value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            coreqs: updatedGroups,
                                        }));
                                    }}
                                    disableCloseOnSelect
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.label}
                                        </li>
                                    )}
                                    renderTags={(selectedOptions, getTagProps) =>
                                        selectedOptions.map((option, index) => (
                                            <Chip key={option.value} label={option.label} {...getTagProps({ index })} />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label={`Corequisite Group ${groupIndex + 1}`} variant="outlined" fullWidth />
                                    )}
                                />
                            </div>
                        ))}
                        <Button
                            variant="contained"
                            sx={{marginBottom:"15px"}}
                            onClick={() => {
                            setFormData((prev) => ({
                                ...prev,
                                coreqs: [...prev.coreqs, []],
                            }));
                        }}>
                            + Add Corequisite Group
                        </Button>
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
                        <Autocomplete
                            multiple
                            options={all_seasons} // Array of season options
                            getOptionLabel={(option) => option.name} // Get the season name for display
                            value={
                                Array.isArray(formData.seasons)
                                    ? formData.seasons
                                        .map((id) =>
                                            all_seasons.find((season) => season.id === id)
                                        )
                                        .filter((season) => season !== undefined)
                                    : []
                            } // Map the selected season IDs to corresponding objects
                            onChange={handleChangeSeason} // Handle change
                            disableCloseOnSelect
                            renderOption={(props, option, {selected}) => {
                                const {key, ...optionProps} = props;
                                return (
                                    <li key={key} {...optionProps}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{marginRight: 8}}
                                            checked={selected}
                                        />
                                        {option.name}
                                    </li>
                                );
                            }}
                            renderTags={(selectedSeasons, getTagProps) =>
                                selectedSeasons.map((option, index) => (
                                    <Chip
                                        key={option.id}
                                        label={option.name}
                                        {...getTagProps({index})}
                                    />
                                ))
                            } // Render chips for selected seasons
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seasons *"
                                    variant="outlined"
                                    fullWidth
                                    error={seasonError}
                                    helperText={
                                        seasonError ? "Please select at least one season" : ""
                                    }
                                />
                            )}
                            sx={{width: "100%"}} // Full width
                        />
                    </div>
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
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
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
                            <TextField
                                required
                                autoFocus
                                margin="dense"
                                id="link"
                                label="Course Details Link"
                                type="text"
                                className="input_textfield"
                                value={formData.link}
                                onChange={handleChange}
                                fullWidth
                            />
                        </div>
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
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
                            control={<Switch id="editable_credits" onChange={handleChange}/>}
                        />
                        <div style={{paddingTop: "5px", paddingBottom: "10px"}}>
                            <Autocomplete
                                options={form_elective_fields} // Array of elective field options
                                getOptionLabel={(option) =>
                                    `${option.type_name} ${option.field_number}: ${option.field_name}`
                                } // Define how each option is labeled in the dropdown
                                value={
                                    formData.elective_field !== -1
                                        ? form_elective_fields.find(
                                            (elective_field) =>
                                                elective_field.id === formData.elective_field
                                        )
                                        : null
                                } // Map the selected elective field ID to the corresponding object
                                onChange={handleChangeElectiveField} // Handle the change event
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Elective Field *"
                                        variant="outlined"
                                        fullWidth
                                        error={electiveError}
                                        helperText={
                                            electiveError ? "Please select an elective field" : ""
                                        }
                                    />
                                )}
                                sx={{width: "100%"}} // Full width
                            />
                        </div>
                        <div className="form-input-title">
                            <Autocomplete
                                disablePortal
                                options={creditTypes} // Array of major options
                                getOptionLabel={(option) => option.name} // Extract major from the object
                                value={
                                    creditTypes.find(
                                        (creditTypes) => creditTypes.id === formData.credit_type
                                    ) || null
                                } // Handle controlled value
                                // onChange={handleChangeMajor} // Handle change
                                onChange={handleChangeCreditType}
                                sx={{width: "100%"}} // Set width to full
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Credit Type *"
                                        variant="outlined"
                                        fullWidth
                                        error={creditTypeError}
                                        helperText={
                                            creditTypeError ? "Please select a credit type" : ""
                                        }
                                    />
                                )}
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
                    setClasses={async (courses) => {
                        const enriched = await enrichCourseData(courses);
                        setClasses(enriched);
                    }}
                />

                <div className="course-table">
                    <TableContainer
                        sx={{borderRadius: "10px", overflow: "hidden", boxShadow: "3"}}
                        component={Paper}
                    >
                        <Table sx={{minWidth: 700}} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center">Course Name</StyledTableCell>
                                    <StyledTableCell align="center">Major</StyledTableCell>
                                    <StyledTableCell align="center">Term</StyledTableCell>
                                    <StyledTableCell align="center">Credits</StyledTableCell>
                                    <StyledTableCell align="center">
                                        Elective Field
                                    </StyledTableCell>
                                    <StyledTableCell align="center">Action</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classes
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <React.Fragment key={row.id}>
                                            <StyledTableRow>
                                                <Tooltip
                                                    title={"Full Name: " + row.title}
                                                    placement="right"
                                                >
                                                    <StyledTableCell
                                                        align="center"
                                                        component="th"
                                                        scope="row"
                                                    >
                                                        {majors.find((major) => major.id === row.major)
                                                            ?.abbreviation || "N/A"}{" "}
                                                        {row.class_number}
                                                    </StyledTableCell>
                                                </Tooltip>
                                                <StyledTableCell align="center">
                                                    <Tooltip
                                                        title={
                                                            majors.find((major) => major.id === row.major)
                                                                ?.name || "N/A"
                                                        }
                                                    >
                            <span>
                              {majors.find((major) => major.id === row.major)
                                  ?.abbreviation || "N/A"}
                            </span>
                                                    </Tooltip>
                                                </StyledTableCell>
                                                <StyledTableCell align="center">
                                                    {row.seasons.length === 4
                                                        ? "ALL"
                                                        : row.seasons.map((season) => {
                                                            const matchedSeason = all_seasons.find(
                                                                (temp_season) => temp_season.id === season
                                                            );
                                                            return matchedSeason ? (
                                                                <li
                                                                    style={{listStyleType: "none"}}
                                                                    key={matchedSeason.name}
                                                                >
                                                                    {matchedSeason.name}
                                                                </li>
                                                            ) : null;
                                                        })}
                                                </StyledTableCell>
                                                <StyledTableCell align="center">
                                                    {row.credits}
                                                </StyledTableCell>
                                                <StyledTableCell align="center">
                                                    {(() => {
                                                        const field = electiveFieldList.find(
                                                            ({id}) => id === row.elective_field
                                                        );
                                                        // console.log(field);
                                                        return field
                                                            ? `${field.type_name} ${field.field_number}: ${field.field_name}`
                                                            : "Elective Field Not found";
                                                    })()}
                                                </StyledTableCell>
                                                <StyledTableCell align="center">
                                                    {props.userDetails &&
                                                        props.userDetails.role === "admin" && (
                                                            <Button
                                                                sx={{color: "black"}}
                                                                onClick={() => handleEditClick(row)}
                                                            >
                                                                <AiOutlineEdit/>
                                                            </Button>
                                                        )}
                                                    <Button onClick={() => handleInfoClick(row.id)}>
                                                        <AiOutlineInfoCircle/>
                                                    </Button>
                                                    {props.userDetails &&
                                                        props.userDetails.role === "admin" && (
                                                            <Button
                                                                sx={{color: "red"}}
                                                                onClick={() => setDeleteConfirmation(true)}
                                                            >
                                                                <AiOutlineDelete/>
                                                            </Button>
                                                        )}
                                                    <ConfirmationDialog
                                                        open={deleteConfirmation}
                                                        handleClose={() => {
                                                            setDeleteConfirmation(false);
                                                        }}
                                                        message="Are you sure you want to delete this course from the database?"
                                                        handleSubmit={() => {
                                                            handleDelete(row);
                                                            setDeleteConfirmation(false);
                                                        }}
                                                    />
                                                </StyledTableCell>
                                            </StyledTableRow>
                                            <StyledTableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    style={{padding: "0 0 0 20px"}}
                                                >
                                                    <Collapse
                                                        in={openInfo === row.id}
                                                        timeout="auto"
                                                        unmountOnExit
                                                    >
                                                        <Box sx={{margin: 1}}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                <div>
                                                                    <b>Title:</b> {row.title}
                                                                </div>
                                                                {props.token && (
                                                                    <Button
                                                                        sx={{
                                                                            color: "white",
                                                                            backgroundColor: "maroon",
                                                                            marginRight: "20px",
                                                                        }}
                                                                        onClick={() => {
                                                                            const selectedCourse = row;
                                                                            setOpenAddToPlanDialog(true);
                                                                            setPlanSelectForm({
                                                                                plan: null,
                                                                                course: selectedCourse,
                                                                            });
                                                                        }}
                                                                    >
                                                                        Add To Plan
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <b>Description:</b> {row.description}
                                                            </div>
                                                            <div>
                                                                <b>Prerequisites:</b>{" "}
                                                                {Array.isArray(row.prereq_groups) && row.prereq_groups.some(group => group.length > 0)
                                                                    ? row.prereq_groups
                                                                        .filter(group => group.length > 0)
                                                                        .map((group) => {
                                                                            const courseNames = group
                                                                                .map((id) => {
                                                                                    const course = row.prereq_objects?.find((c) => c.id === id);
                                                                                    if (!course) return null;
                                                                                    const major = majors.find((m) => m.id === course.major);
                                                                                    return `${major?.abbreviation || "N/A"} ${course.class_number}`;
                                                                                })
                                                                                .filter(Boolean)
                                                                                .join(" and ");
                                                                            return `[${courseNames}]`;
                                                                        })
                                                                        .join(" or ")
                                                                    : "No Prerequisites for this course"}
                                                            </div>
                                                            <div>
                                                                <b>Corequisites:</b>{" "}
                                                                {Array.isArray(row.coreq_groups) && row.coreq_groups.some(group => group.length > 0)
                                                                    ? row.coreq_groups
                                                                        .filter(group => group.length > 0)
                                                                        .map((group) => {
                                                                            const courseNames = group
                                                                                .map((id) => {
                                                                                    const course = row.coreq_objects?.find((c) => c.id === id);
                                                                                    if (!course) return null;
                                                                                    const major = majors.find((m) => m.id === course.major);
                                                                                    return `${major?.abbreviation || "N/A"} ${course.class_number}`;
                                                                                })
                                                                                .filter(Boolean)
                                                                                .join(" and ");
                                                                            return `[${courseNames}]`;
                                                                        })
                                                                        .join(" or ")
                                                                    : "No Corequisites for this course"}
                                                            </div>

                                                            <div>
                                                                <b>Link: </b>
                                                                <a
                                                                    href={row.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {row.link}
                                                                </a>
                                                            </div>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </StyledTableRow>
                                        </React.Fragment>
                                    ))}
                            </TableBody>
                            <TableFooter className="table-footer">
                                <TableRow sx={{width: "100%"}}>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        colSpan={7}
                                        count={classes.length}
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
                        <AddCircleOutlineIcon/>
                    </IconButton>
                )}
            </div>
        </div>
    );
};

export default Courses;
