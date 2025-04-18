import React, {useState, useEffect, useRef} from "react";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import BackToHome from "../Components/BackToHomeDialog";
import axios from "axios";
import {useParams} from "react-router-dom";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {NotificationManager} from "react-notifications";
import {green, red} from "@mui/material/colors";
import {AiOutlineEdit} from "react-icons/ai";
import {AiOutlineDelete} from "react-icons/ai";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {Menu, MenuItem} from "@mui/material";
import {AiOutlineInfoCircle} from "react-icons/ai";
import ConfirmationDialog from "../Components/ConfirmationDialog";

const ItemType = "CARD";

const Course = ({
                    id,
                    course,
                    moveCourse,
                    majorList,
                    handleDeleteCourse,
                    semesterId,
                    handleUpdateCredit,
                    electiveFieldList
                }) => {
    const [{isDragging}, drag] = useDrag(() => ({
        type: ItemType,
        item: {id},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const majorAbbr = majorList[course.major] || "N/A"; // Lookup abbreviation
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [prereqs, setPrereqs] = useState([]);
    const [coreqs, setCoreqs] = useState([]);
    const [updatedCredits, setUpdatedCredits] = useState(course.credits);

    const getListCourses = async () => {
        try {
            // ✅ Flatten prereq and coreq groups to get unique course IDs
            const prereqIds = Array.isArray(course.prereq_groups)
                ? [...new Set(course.prereq_groups.flat())]
                : [];
            const coreqIds = Array.isArray(course.coreq_groups)
                ? [...new Set(course.coreq_groups.flat())]
                : [];

            // ✅ Fetch all unique courses in parallel
            const prereqPromises = prereqIds.map((id) =>
                axios
                    .get(`http://plan-of-study.cs.vt.edu:8000/api/classes/${id}/`)
                    .then((res) => res.data)
            );
            const coreqPromises = coreqIds.map((id) =>
                axios
                    .get(`http://plan-of-study.cs.vt.edu:8000/api/classes/${id}/`)
                    .then((res) => res.data)
            );

            const prereqsData = await Promise.all(prereqPromises);
            const coreqsData = await Promise.all(coreqPromises);

            setPrereqs(prereqsData);
            setCoreqs(coreqsData);
        } catch (error) {
            console.error("Error fetching course data", error);
        }
    };

    useEffect(() => {
        setUpdatedCredits(course.credits);
    }, [course.credits]);


    useEffect(() => {
        getListCourses();
    }, [course]); // Re-fetch whenever `course` changes

    return (
        <div
            ref={drag}
            className="course-item"
            style={{opacity: isDragging ? 0.5 : 1, whiteSpace: "pre-line"}}
        >
            <div className="course-container">
                <div className="course-item-top">
                    <div className="course-number-title">
                        {majorAbbr} {course.class_number} {course.title}
                    </div>
                    <div
                        className="course-description-button"
                        onClick={() => setOpenDialog(true)}
                    >
                        <AiOutlineInfoCircle/>
                    </div>
                </div>
                <div className="course-item-bottom">
                    <div className="course-credit">Credit: {course.credits}</div>
                    <div className="course-delete-button">
                        <Button
                            sx={{color: "red", minWidth: "30px", maxWidth: "30px"}}
                            onClick={() => setOpenDeleteDialog(true)}
                        >
                            <AiOutlineDelete/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Popup Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle style={{textAlign: "center"}}>
                    Course Information
                </DialogTitle>
                <DialogContent>
                    <h3>
                        {majorAbbr} {course.class_number} {course.title}
                    </h3>
                    <p>
                        <b>Description</b>: {course.description}
                    </p>
                    <p>
                        <b>elective field: </b> {(() => {
                        const field = electiveFieldList.find(
                            ({id}) => id === course.elective_field
                        );
                        // console.log(field);
                        return field
                            ? `${field.type_name} ${field.field_number}: ${field.field_name}`
                            : "Elective Field Not found";
                    })()}</p>

                    <p>
                        <b>Prerequisites</b>:{" "}
                        {Array.isArray(course.prereq_groups) &&
                        course.prereq_groups.some((group) => group.length > 0)
                            ? course.prereq_groups
                                .filter((group) => group.length > 0)
                                .map((group, i) => {
                                    const names = group
                                        .map((id) => {
                                            const match = prereqs.find((p) => p.id === id);
                                            return match
                                                ? `${majorList[match.major]} ${match.class_number}`
                                                : null;
                                        })
                                        .filter(Boolean)
                                        .join(" and ");
                                    return `[${names}]`;
                                })
                                .join(" or ")
                            : "No Prerequisites for this course"}
                    </p>
                    <p>
                        <b>Corequisites</b>:{" "}
                        {Array.isArray(course.coreq_groups) &&
                        course.coreq_groups.some((group) => group.length > 0)
                            ? course.coreq_groups
                                .filter((group) => group.length > 0)
                                .map((group, i) => {
                                    const names = group
                                        .map((id) => {
                                            const match = coreqs.find((c) => c.id === id);
                                            return match
                                                ? `${majorList[match.major]} ${match.class_number}`
                                                : null;
                                        })
                                        .filter(Boolean)
                                        .join(" and ");
                                    return `[${names}]`;
                                })
                                .join(" or ")
                            : "No Corequisites for this course"}
                    </p>
                    <p>
                        <b>Link</b>: &nbsp;
                        <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-link"
                        >
                            Course Description
                        </a>
                    </p>
                    {course.editable_credits && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "1rem",
                            }}
                        >
                            <TextField
                                label="Update Credits"
                                type="number"
                                value={updatedCredits}
                                onChange={(e) => setUpdatedCredits(parseInt(e.target.value))}
                                InputProps={{inputProps: {min: 0}}}
                                sx={{marginRight: 2, width: 120}}
                            />
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    handleUpdateCredit(course, semesterId, updatedCredits);
                                    setOpenDialog(false);
                                }}
                                sx={{minWidth: "30px", maxWidth: "20px", maxHeight: "30px"}}
                            >
                                <CheckBoxIcon/>
                            </Button>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={openDeleteDialog}
                handleClose={() => setOpenDeleteDialog(false)}
                message="Are you sure you want to remove this course from your plan?"
                handleSubmit={() => {
                    handleDeleteCourse(course, semesterId);
                    setOpenDeleteDialog(false);
                }}
            />
        </div>
    );
};

const Semester = ({
                      title,
                      courses,
                      moveCourse,
                      semesterId,
                      semester,
                      handleEditSemesterClick,
                      majorList,
                      handleDeleteCourse,
                      handleDeleteSemester,
                      handleUpdateCredit,
                      electiveFieldList
                  }) => {
    const [, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (item) => moveCourse(item.id, semesterId), // Ensure a valid drop happens
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    // console.log("courses", courses);
    // console.log("semester", semester);

    const creditCount = (courses) => {
        return courses.reduce((totalCredits, course) => {
            return totalCredits + course.credits;
        }, 0); // Initialize totalCredits with 0
    };
    // console.log("creditCount", creditCount);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <div ref={drop} className="semester course-cart-color course-cart-scroll">
            <div className="semester-header course-cart-color">
                <div style={{display: "flex"}}>
                    <h3>{title}</h3>
                    {/* This is the other format of edit and delete buttons of each semester card */}
                    {/* {title !== "Course Cart" && <Button
                        sx={{color: "black", marginLeft: "10px", minWidth: "30px", maxWidth: "30px"}}
                        onClick={() => handleEditSemesterClick(semester)}>
                        <AiOutlineEdit/>
                    </Button>}
                    {title !== "Course Cart" && <Button
                        sx={{color: "red", minWidth: "30px", maxWidth: "30px"}}
                        onClick={(event) => event.stopPropagation()}>
                        <AiOutlineDelete/>
                    </Button>} */}

                    {title !== "Course Cart" && (
                        <>
                            <Button className="semester-menu-button" onClick={handleMenuOpen}>
                                <MoreVertIcon className="semester-menu-button"/>
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem
                                    onClick={() => {
                                        handleEditSemesterClick(semester);
                                        handleMenuClose();
                                    }}
                                >
                                    <AiOutlineEdit style={{marginRight: "8px"}}/> Edit
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        handleDeleteSemester(semester);
                                        handleMenuClose();
                                    }}
                                    style={{color: "red"}}
                                >
                                    <AiOutlineDelete style={{marginRight: "8px"}}/> Delete
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </div>
                {semester === undefined ? (
                    <span className="credits">Credits: {creditCount(courses)}</span>
                ) : (
                    <span
                        className="credits"
                        style={
                            creditCount(courses) > semester.max_credits
                                ? {color: "red"}
                                : {color: "green"}
                        }
                    >
            Credits: {creditCount(courses)}/{semester.max_credits}
          </span>
                )}
            </div>
            {courses.map((course) => (
                <Course
                    key={course.course_id}
                    id={course.course_id}
                    course={course}
                    moveCourse={moveCourse}
                    majorList={majorList} // Pass majorList
                    handleDeleteCourse={handleDeleteCourse}
                    semesterId={semesterId}
                    handleUpdateCredit={handleUpdateCredit}
                    electiveFieldList={electiveFieldList}
                />
            ))}
        </div>
    );
};

const Plan = (props) => {
    const {id} = useParams();
    const [openHome, setOpenHome] = useState(false);

    const [currentEditPlan, setCurrentEditPlan] = useState({
        course_cart: [],
        credits: 0,
        id: null,
        name: "",
        requirement_filled: false,
        semesters: [],
        template: null,
    });
    const [editPlanData, setEditPlanData] = useState({
        course_cart: [],
        credits: 0,
        id: null,
        name: "",
        requirement_filled: false,
        semesters: [],
        template: null,
    });
    const [requirementList, setRequirementList] = useState([]);
    const [semesterCourseList, setSemesterCourseList] = useState([]);
    const [courseCart, setCourseCart] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [seasonList, setSeasonList] = useState([]);
    const [majorList, setMajorList] = useState([]);
    const [planMajor, setPlanMajor] = useState(null);
    const currentYear = new Date().getFullYear();
    const yearList = Array.from({length: 10}, (_, i) => currentYear + i); // Generate years
    const [semesterFormData, setSemesterFormData] = useState({
        plan: id,
        season: null,
        year: null,
        max_credits: null,
        min_credits: null,
    });
    const [currentEditSemester, setCurrentEditSemester] = useState(null);
    const skipSemesterRefresh = useRef(false);
    const [template, setTemplate] = useState(null);
    const [semesterFormTitle, setSemesterFormTitle] = useState("");

    const COMPARISON_CHOICES = {
        "==": "is",
        ">=": "is at least",
        "<=": "is at most",
        ">": "is more than",
        "<": "is less than",
    };

    const getComparisonLabel = (choice) => {
        return COMPARISON_CHOICES[choice] || choice; // Return the label or fallback to the original choice if not found
    };

    const [hoveredStatus, setHoveredStatus] = useState(null);

    const prevRequirementList = useRef(null); // Track previous requirements state
    const prevSemesterList = useRef(null); // Track previous semester state
    const initialRequirementCheck = useRef(false); // Track if the first check was made
    const [electReq, setEleReq] = useState(null);
    const [creditReq, setCreditReq] = useState(null);
    const [electiveFieldList, setElectiveFieldList] = useState([])


    const getPlan = async () => {
        // console.log("get plan");
        try {
            const res = await axios.get(
                `http://plan-of-study.cs.vt.edu:8000/api/plan/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            // console.log("Fetched Plan:", res.data); // ✅ Debugging step
            setCurrentEditPlan((prevState) => ({
                ...prevState,
                ...res.data,
                course_cart: res.data.course_cart || [],
                semesters: res.data.semesters || [],
            }));

            const plan = res.data;
            setEditPlanData(plan);
            setCourseCart(plan.course_cart);
        } catch (error) {
            if (error.response && error.response.status === 500) {
                console.error("Server error (500) encountered. Redirecting home...");
                setOpenHome(true); // ✅ Trigger the home dialog
            } else {
                console.error("Error fetching plan data", error);
            }
        }
    };

    const getPlanMajor = async () => {
        if (template) {
            try {
                const res = await axios.get(
                    `http://plan-of-study.cs.vt.edu:8000/api/major/${template.major}`
                );
                setPlanMajor(res.data);
                // console.log("major: ", res.data)
            } catch (e) {
                console.error("Error fetching plan major data", e);
            }
        }
    };

    const getListMajors = async () => {
        try {
            const res = await axios.get(
                "http://plan-of-study.cs.vt.edu:8000/api/major/"
            );
            const majorMap = res.data.reduce((acc, major) => {
                acc[major.id] = major.abbreviation;
                return acc;
            }, {});
            setMajorList(majorMap); // Store as an object for easy lookup
        } catch (error) {
            console.error("Error fetching major data:", error);
        }
    };

    const getListRequirements = async () => {
        // console.log("get requirement list");

        const requirementsData = await Promise.all(
            template.requirements.map(async (requirement_id) => {
                try {
                    const requirementResponse = await axios.get(
                        `http://plan-of-study.cs.vt.edu:8000/api/requirement/${requirement_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        }
                    );
                    const requirement = requirementResponse.data;
                    // Fetch the major object for the requirement
                    const majorResponse = await axios.get(
                        `http://plan-of-study.cs.vt.edu:8000/api/major/${requirement.major}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        }
                    );
                    requirement.major_name = majorResponse.data.name; // Attach major name to requirement

                    // Fetch the credit type object for the requirement
                    const creditTypeResponse = await axios.get(
                        `http://plan-of-study.cs.vt.edu:8000/api/credit-type/${requirement.credit_type}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        }
                    );
                    requirement.credit_type_name = creditTypeResponse.data.name; // Attach credit type name to requirement
                    // console.log("requirement", requirement.id, requirement);
                    return requirement;
                } catch (error) {
                    console.error("Error fetching requirement:", requirement_id, error);
                }
            })
        );
        // console.log("template", template);

        setRequirementList(requirementsData);
    };

    const getTemplate = async () => {
        // console.log("get template");
        try {
            const res = await axios.get(
                `http://plan-of-study.cs.vt.edu:8000/api/template/${editPlanData.template}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setTemplate(res.data);
        } catch (error) {
            console.error("Error fetching template data", error);
        }
    };

    const getListElectiveField = async () => {
        try {
            const majorId = template.major;
            const res = await axios.get(
                `http://plan-of-study.cs.vt.edu:8000/api/elective-field/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                    params: {major: majorId}
                }
            );
            const electiveFields = res.data.sort(
                (a, b) => a.field_number - b.field_number
            );
            setElectiveFieldList(electiveFields);
        } catch (error) {
            console.error("Error fetching course data", error);
        }
    }

    const getListSemesters = async () => {
        // console.log("get semester list");
        try {
            if (!id) {
                console.error("Plan ID is missing.");
                return;
            }

            // Fetch semesters for the plan
            const semestersData = await Promise.all(
                currentEditPlan.semesters.map(async (semesterId) => {
                    try {
                        const semesterResponse = await axios.get(
                            `http://plan-of-study.cs.vt.edu:8000/api/semester/${semesterId}/`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                        "accessToken"
                                    )}`,
                                },
                            }
                        );

                        const semester = semesterResponse.data;
                        return {
                            ...semester,
                            courses: semester.classes || [], // ✅ Ensure courses is always an array
                        };
                    } catch (error) {
                        console.error("Error fetching semester:", semesterId, error);
                        return null;
                    }
                })
            );

            const validSemesters = semestersData.filter(
                (semester) => semester !== null
            );
            const sortedSemesters = validSemesters.slice().sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.season - b.season; // Assumes season is numeric (Spring = 1, Summer = 2, Fall = 3, Winter = 4)
            });

            setSemesterList(sortedSemesters);

            setSemesterCourseList(
                sortedSemesters.map((semester) => ({
                    semester_id: semester.id,
                    course_list: semester.courses || [], // ✅ Ensures course_list is always an array
                }))
            );

            // console.log("Updated semesterList:", validSemesters);
        } catch (error) {
            console.error("Error fetching semesters data", error);
        }
    };

    const getListSeasons = async () => {
        // console.log("get season list")
        try {
            const res = await axios.get(
                `http://plan-of-study.cs.vt.edu:8000/api/season/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            // console.log("Fetched seasons:", res.data); // ✅ Debugging step
            setSeasonList(res.data);
        } catch {
            console.error("Error fetching seasons data");
        }
    };

    const checkRequirementsFulfilled = async (shouldUpdateBackend = false) => {
        if (!currentEditPlan.id || currentEditPlan.id === "null") {
            console.warn("Skipping requirements check: Invalid plan ID.");
            return; // ✅ Prevent API request when ID is missing
        }
        if (requirementList.length === 0) {
            console.warn("Skipping requirements check: No requirements to check");
            return;
        }
        console.log("Checking if requirements are fulfilled...");

        // Flatten all courses from semesters into a single list
        const allCourses = semesterCourseList.flatMap(
            (semester) => semester.course_list
        );

        const electiveFieldSet = new Set(
            allCourses
                .map((course) => course.elective_field)
                .filter((fieldId) => {
                    const fieldObj = electiveFieldList.find((f) => f.id === fieldId);
                    return fieldObj && fieldObj.field_number >= 0;
                })
        );
        if (electiveFieldSet.size >= template.min_elective_fields) {
            setEleReq({
                filled: true,
                count: electiveFieldSet.size
            });
        } else {
            setEleReq({
                filled: false,
                count: electiveFieldSet.size
            });
        }

        const creditsForCourseCredit = allCourses
            .filter((course) => {
                const field = electiveFieldList.find((f) => f.id === course.elective_field);
                return course.credit_type === 1 && field && field.field_number !== -3;
            })
            .reduce((sum, course) => sum + course.credits, 0);

        setCreditReq({
            filled: creditsForCourseCredit >= template.min_credits,
            count: creditsForCourseCredit
        })

        // Create a copy of requirementList with updated "filled" status
        const updatedRequirements = requirementList.map((requirement) => {
            const matchedCourses = allCourses.filter((course) => {
                const matchesMajor = requirement.include
                    ? course.major === requirement.major
                    : course.major !== requirement.major;

                const matchesCreditType =
                    course.credit_type === requirement.credit_type;

                let matchesAttribute = true;
                if (requirement.attribute) {
                    const courseAttributeValue =
                        course[requirement.attribute] !== undefined
                            ? course[requirement.attribute]
                            : course.class_number;

                    if (courseAttributeValue === undefined) {
                        matchesAttribute = false;
                    } else {
                        const requirementAttributeValue = requirement.attribute_value;
                        switch (requirement.attribute_choice) {
                            case "==":
                                matchesAttribute =
                                    courseAttributeValue === requirementAttributeValue;
                                break;
                            case ">=":
                                matchesAttribute =
                                    courseAttributeValue >= requirementAttributeValue;
                                break;
                            case "<=":
                                matchesAttribute =
                                    courseAttributeValue <= requirementAttributeValue;
                                break;
                            case ">":
                                matchesAttribute =
                                    courseAttributeValue > requirementAttributeValue;
                                break;
                            case "<":
                                matchesAttribute =
                                    courseAttributeValue < requirementAttributeValue;
                                break;
                            default:
                                matchesAttribute = true;
                        }
                    }
                }
                return matchesMajor && matchesCreditType && matchesAttribute;
            });

            const totalCredits = matchedCourses.reduce(
                (sum, course) => sum + course.credits,
                0
            );

            let requirementMet;
            switch (requirement.requirement_type) {
                case "==":
                    requirementMet = totalCredits === requirement.requirement_size;
                    break;
                case ">=":
                    requirementMet = totalCredits >= requirement.requirement_size;
                    break;
                case "<=":
                    requirementMet = totalCredits <= requirement.requirement_size;
                    break;
                case ">":
                    requirementMet = totalCredits > requirement.requirement_size;
                    break;
                case "<":
                    requirementMet = totalCredits < requirement.requirement_size;
                    break;
                default:
                    requirementMet = false;
            }

            return {
                ...requirement,
                filled: requirementMet,
                totalCredits: totalCredits,
            };
        });

        // ✅ Prevent unnecessary updates
        const hasRequirementChanged =
            JSON.stringify(updatedRequirements) !== JSON.stringify(requirementList);
        if (hasRequirementChanged) {
            setRequirementList(updatedRequirements);
        }

        const allRequirementsMet =
            updatedRequirements.every((req) => req.filled) &&
            electReq?.filled === true &&
            creditReq?.filled === true;

        // ✅ Prevent unnecessary `setState` updates
        setCurrentEditPlan((prevPlan) =>
            prevPlan.requirement_filled === allRequirementsMet
                ? prevPlan
                : {...prevPlan, requirement_filled: allRequirementsMet}
        );

        // console.log("Updated requirements:", updatedRequirements);
        // console.log("Requirement fulfillment status:", allRequirementsMet);

        // ✅ Only update backend if:
        // - The user explicitly saves (`shouldUpdateBackend` is true)
        // - The initial page load needs it (`initialRequirementCheck.current` is false)
        if (shouldUpdateBackend || !initialRequirementCheck.current) {
            try {
                await axios.put(
                    `http://plan-of-study.cs.vt.edu:8000/api/plan/${currentEditPlan.id}/`,
                    {
                        requirement_filled: allRequirementsMet,
                        template: currentEditPlan.template,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );
                console.log(
                    "✅ Plan's requirement_filled updated successfully in the backend."
                );
                initialRequirementCheck.current = true;
            } catch (error) {
                console.error("❌ Error updating plan's requirement_filled:", error);
            }
        }
    };

    const handleEditSemesterClick = async (semester) => {
        setSemesterFormData({
            plan: currentEditPlan,
            season: semester.season,
            year: semester.year,
            max_credits: semester.max_credits,
            min_credits: semester.min_credits,
        });
        setSemesterFormTitle("Edit Semester");
        setCurrentEditSemester(semester);
        setOpenDialog(true);
    };

    const validatePrereqs = (
        movedCourse,
        targetSemesterId,
        semesterCourseList,
        newCart
    ) => {
        let previousCourses = []; // Courses before the target semester
        let targetSemesterFound = false;

        for (const semester of semesterCourseList) {
            if (semester.semester_id === targetSemesterId) {
                targetSemesterFound = true;
                break;
            }
            semester.course_list.forEach((course) => previousCourses.push(course));
        }

        // ✅ Validate prerequisites
        const prereqGroups = Array.isArray(movedCourse.prereq_groups)
            ? movedCourse.prereq_groups
            : [[]];

        const hasSatisfiedGroup = prereqGroups.some((group) => {
            return (
                Array.isArray(group) &&
                group.every((prereqId) => {
                    return previousCourses.some((course) => course.id === prereqId);
                })
            );
        });

        if (!hasSatisfiedGroup && prereqGroups.some((group) => group.length > 0)) {
            NotificationManager.warning(
                `Cannot move course ${movedCourse.title}\n please check the prerequisites for this course~`,
                "Missing prerequisites",
                5000
            );
            return false;
        }

        // ✅ Validate corequisites (must exist in same semester)
        const currentSemester = semesterCourseList.find(
            (semester) => semester.semester_id === targetSemesterId
        );

        const coreqGroups = Array.isArray(movedCourse.coreq_groups)
            ? movedCourse.coreq_groups
            : [];

        const hasSatisfiedCoreqGroup =
            coreqGroups.length === 0 ||
            coreqGroups.some((group) => {
                return (
                    Array.isArray(group) &&
                    group.every((coreqId) => {
                        return currentSemester.course_list.some(
                            (course) => course.id === coreqId
                        );
                    })
                );
            });

        if (!hasSatisfiedCoreqGroup) {
            NotificationManager.warning(
                `Cannot move course ${movedCourse.title}\n please check the corequisites for this course~`,
                "Missing corequisites",
                5000
            );
            return false;
        }

        return true; // ✅ All validations passed
    };

    // needs fixing
    const moveCourse = (courseId, targetSemesterId) => {
        skipSemesterRefresh.current = true; // ✅ Prevent useEffect from running

        console.log(`Moving course ${courseId} to semester ${targetSemesterId}`);

        setSemesterCourseList((prevSemesterCourseList) => {
            let movedCourse = null;
            let previousSemesterId = "coursecart";

            // Find the course from its current location
            // from semesters
            for (let semesterData of prevSemesterCourseList) {
                const courseIndex = semesterData.course_list.findIndex(
                    (course) => course.course_id === courseId
                );
                if (courseIndex !== -1) {
                    movedCourse = semesterData.course_list[courseIndex];
                    previousSemesterId = semesterData.semester_id;
                    // if (previousSemesterId !== targetSemesterId) {
                    //     semesterData.course_list = semesterData.course_list.filter(
                    //         (course) => course.course_id !== courseId
                    //     );
                    // }
                    break;
                }
            }

            let newCart = courseCart;
            // from cart
            if (!movedCourse) {
                // Use callback to ensure we get latest courseCart
                const foundInCart = courseCart.find(c => c.course_id === courseId);

                if (foundInCart) {
                    movedCourse = foundInCart;
                    previousSemesterId = "coursecart";
                }
            }
            // no course found
            if (!movedCourse) {
                console.error(`Error: Course ${courseId} not found.`);
                return prevSemesterCourseList;
            }

            // Prevent redundant moves
            if (previousSemesterId === targetSemesterId) {
                console.warn("Move ignored: Course is already in the target location.");
                return prevSemesterCourseList;
            }
            // check for prereqs if needed
            if (
                targetSemesterId !== "coursecart" &&
                !validatePrereqs(
                    movedCourse,
                    targetSemesterId,
                    prevSemesterCourseList,
                    newCart
                )
            ) {
                return prevSemesterCourseList; // revert
            }
            // move course out of course cart if it's moving from course cart
            if (previousSemesterId === "coursecart") {
                setCourseCart((prevCourseCart) =>
                    prevCourseCart.filter((course) => course.course_id !== courseId)
                );
                setCurrentEditPlan((prevCurrentEditPlan) => ({
                    ...prevCurrentEditPlan,
                    course_cart: prevCurrentEditPlan.course_cart.filter(
                        (id) => id !== courseId
                    ),
                }));
            }

            if (targetSemesterId === "coursecart") {
                setCourseCart((prevCourseCart) => [...prevCourseCart, movedCourse]);
                setCurrentEditPlan((prevCurrentEditPlan) => ({
                    ...prevCurrentEditPlan,
                    course_cart: [...prevCurrentEditPlan.course_cart, movedCourse],
                }));
            }
            // else {
            // const targetEntry = prevSemesterCourseList.find(
            //     (entry) => entry.semester_id === targetSemesterId
            // );
            // if (targetEntry) {
            //     targetEntry.course_list.push(movedCourse);
            // } else {
            //     prevSemesterCourseList.push({
            //         semester_id: targetSemesterId,
            //         course_list: [movedCourse],
            //     });
            // }
            // }

            const targetSemester = prevSemesterCourseList.find(
                (entry) => entry.semester_id === targetSemesterId
            );
            if (targetSemester) {
                targetSemester.course_list.push(movedCourse);
            } else {
                prevSemesterCourseList.push({
                    semester_id: targetSemesterId,
                    course_list: [movedCourse],
                });
            }
            const previousEntry = prevSemesterCourseList.find(
                (entry) => entry.semester_id === previousSemesterId
            );
            if (previousEntry) {
                previousEntry.course_list = previousEntry.course_list.filter(
                    (entry) => entry.course_id !== courseId
                );
            }

            setSemesterList((prevSemesterList) => {
                console.log("we ran this ");
                const newSemesterList = prevSemesterList.map((semester) => {
                    if (semester.id === previousSemesterId) {
                        return {
                            ...semester,
                            courses: semester.courses.filter(
                                (course) => course.course_id !== courseId
                            ),
                            classes: semester.classes.filter(
                                (course) => course.course_id !== courseId
                            ),
                        };
                    } else if (semester.id === targetSemesterId) {
                        if (
                            !semester.courses.find((course) => {
                                return course.course_id === courseId;
                            })
                        ) {
                            const temp = {
                                ...semester,
                                courses: [...semester.courses, movedCourse],
                                classes: [...semester.classes, movedCourse],
                            };

                            console.log("temp", temp);
                            return {
                                ...semester,
                                courses: [...semester.courses, movedCourse],
                                classes: [...semester.classes, movedCourse],
                            };
                        }
                        return {...semester};
                    } else {
                        return {...semester};
                    }
                });
                console.log("prevSemesterList", prevSemesterList);
                console.log("newSemesterList", newSemesterList);
                return newSemesterList;
            });

            movedCourse.previousSemester = previousSemesterId;
            movedCourse.currentSemester = targetSemesterId;

            // console.log("semesterList", semesterList)

            setTimeout(() => {
                skipSemesterRefresh.current = false; // ✅ Reset flag after changes apply
            }, 100); // Small delay ensures updates settle before next render

            return prevSemesterCourseList;
        });
    };

    const handleEditSemester = async (e) => {
        e.preventDefault();
        // console.log(semesterFormData); // Debugging
        if (
            semesterList.find((semester) => {
                return (
                    semester.season === semesterFormData.season &&
                    semester.year === semesterFormData.year
                );
            })
        ) {
            NotificationManager.warning("Semester Already Exists", "Warning", 5000);
            return;
        } else {
            const updatedSemesterData = {
                ...semesterFormData,
                max_credits: template.max_semester_credits,
                min_credits: template.min_semester_credits,
            };

            const method = currentEditSemester ? "put" : "post";
            const url = currentEditSemester
                ? `http://plan-of-study.cs.vt.edu:8000/api/semester/${currentEditSemester.id}/` // If editing, use the course ID
                : "http://plan-of-study.cs.vt.edu:8000/api/semester/";
            await props.checkTokenAndRefresh();
            try {
                await axios[method](url, updatedSemesterData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                NotificationManager.success(
                    "Semester added successfully",
                    "Success",
                    5000
                );
            } catch (error) {
                NotificationManager.error("Error adding Semester", "Error", 5000);
                console.error("Error adding Semester", error);
            }
            await getPlan();
            // await getListSemesters();
        }
        setSemesterFormData({
            plan: id,
            season: null,
            year: null,
            max_credits: null,
            min_credits: null,
        });
        setOpenDialog(false);
        setCurrentEditSemester(null);
    };

    // needs fixing - debug needed
    const handleDeleteSemester = async (semester) => {
        console.log("Deleting semester:", semester);

        try {
            // ✅ Step 1: Move all courses to course cart before deleting the semester
            await Promise.all(
                semester.courses.map((course) =>
                    moveCourse(course.course_id, "coursecart")
                )
            );

            // ✅ Step 2: Send DELETE request to remove the semester from the backend
            await axios.delete(
                `http://plan-of-study.cs.vt.edu:8000/api/semester/${semester.id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            // ✅ Step 3: Update the local state by removing the semester
            setSemesterList((prevSemesters) =>
                prevSemesters.filter((s) => s.id !== semester.id)
            );

            // ✅ Step 4: Update the plan by removing the semester reference
            await axios.put(
                `http://plan-of-study.cs.vt.edu:8000/api/plan/${id}/`,
                {
                    ...currentEditPlan,
                    semesters: currentEditPlan.semesters.filter(
                        (sId) => sId !== semester.id
                    ),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            await saveChanges(new Event("submit"));

            NotificationManager.success(
                "Semester removed successfully!",
                "Success",
                5000
            );
        } catch (error) {
            console.error("Error deleting semester:", error);
            NotificationManager.error("Failed to remove semester", "Error", 5000);
        }
    };

    const handleDeleteCourse = async (course, semesterId) => {
        console.log("Deleting course:", course);
        console.log("From semester:", semesterId);

        try {
            if (semesterId === "coursecart") {
                // Remove course from course cart
                await axios.put(
                    `http://plan-of-study.cs.vt.edu:8000/api/plan/${id}/`,
                    {
                        ...currentEditPlan,
                        course_cart: currentEditPlan.course_cart.filter(
                            (c) => c.course_id !== course.course_id
                        ),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );

                // Update state
                setCourseCart((prevCart) =>
                    prevCart.filter((c) => c.course_id !== course.course_id)
                );
            } else {
                // Remove course from semester
                await axios.put(
                    `http://plan-of-study.cs.vt.edu:8000/api/semester/${semesterId}/`,
                    {
                        id: semesterId,
                        classes:
                            semesterList
                                .find((semester) => semester.id === semesterId)
                                ?.courses.filter((c) => c.course_id !== course.course_id) || [],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );

                // Update state
                setSemesterList((prevSemesters) =>
                    prevSemesters.map((semester) =>
                        semester.id === semesterId
                            ? {
                                ...semester,
                                courses: semester.courses.filter(
                                    (c) => c.course_id !== course.course_id
                                ),
                            }
                            : semester
                    )
                );
            }

            try {
                // ✅ Fetch the latest `course_id_list` from the backend
                let latestCourseIdList = [];
                try {
                    const courseResponse = await axios.get(
                        `http://plan-of-study.cs.vt.edu:8000/api/classes/${course.id}/`,
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

                // ✅ Remove the deleted `course_id` from the `course_id_list`
                const updatedCourseIdList = latestCourseIdList.filter(
                    (id) => id !== course.course_id
                );

                // ✅ Update the course with the modified `course_id_list`
                await axios.put(
                    `http://plan-of-study.cs.vt.edu:8000/api/classes/${course.id}/`,
                    {
                        course_id_list: updatedCourseIdList,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );

                console.log(
                    `Removed course_id ${course.course_id} from course_id_list successfully.`
                );
            } catch (error) {
                console.error("Error updating course_id_list:", error);
            }
            await getListSemesters();

            NotificationManager.success(
                "Course removed successfully!",
                "Success",
                5000
            );
        } catch (error) {
            console.error("Error deleting course:", error);
            NotificationManager.error("Failed to remove course", "Error", 5000);
        }
    };

    const handleUpdateCredit = (course, semesterId, updatedCredits) => {
        skipSemesterRefresh.current = true;
        const courseId = course.course_id;

        if (semesterId === "coursecart") {
            const updatedCart = courseCart.map(c =>
                c.course_id === courseId ? { ...c, credits: updatedCredits } : c
            );
            setCourseCart([...updatedCart]); // Force new array
            setCurrentEditPlan(prev => ({
                ...prev,
                course_cart: [...updatedCart],
            }));
        } else {
            const updatedSemesterCourseList = semesterCourseList.map(entry => {
                if (entry.semester_id === semesterId) {
                    const updatedCourseList = entry.course_list.map(c =>
                        c.course_id === courseId ? { ...c, credits: updatedCredits } : c
                    );
                    return {
                        ...entry,
                        course_list: [...updatedCourseList],
                    };
                }
                return entry;
            });

            const updatedSemesterList = semesterList.map(semester => {
                if (semester.id === semesterId) {
                    const updatedCourses = semester.courses.map(c =>
                        c.course_id === courseId ? { ...c, credits: updatedCredits } : c
                    );
                    return {
                        ...semester,
                        courses: [...updatedCourses],
                        classes: [...updatedCourses],
                    };
                }
                return semester;
            });

            setSemesterCourseList([...updatedSemesterCourseList]);
            setSemesterList([...updatedSemesterList]);
            console.log("🔧 Updated credits:", updatedCredits);
            console.log("🧪 Updated course:", course);
            console.log("📚 Semester List:", semesterList);
            console.log("updatedSemesterCourseList", updatedSemesterCourseList)
            console.log("updatedSemesterList", updatedSemesterList)
        }

        setTimeout(() => {
            skipSemesterRefresh.current = false;
        }, 100);

        setOpenDialog(false);
    };



    const saveChanges = async (e) => {
        e.preventDefault();
        await props.checkTokenAndRefresh();

        try {
            // Update each semester with full course objects in `classes`
            await Promise.all(
                semesterList.map(async (semester) => {
                    try {
                        await axios.put(
                            `http://plan-of-study.cs.vt.edu:8000/api/semester/${semester.id}/`,
                            {
                                id: semester.id,
                                classes: semester.courses, // ✅ Make sure these include updated credits
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                },
                            }
                        );
                    } catch (semesterError) {
                        console.error(`Error updating semester ${semester.id}:`, semesterError);
                    }
                })
            );


            // Update the plan with full `course_cart` objects
            await axios.put(
                `http://plan-of-study.cs.vt.edu:8000/api/plan/${id}/`,
                {
                    ...currentEditPlan,
                    course_cart: courseCart, // ✅ Send full course objects, not just IDs
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            NotificationManager.success("All Changes Saved!", "Success", 5000);
            await checkRequirementsFulfilled(true);
        } catch (error) {
            NotificationManager.error("Error saving changes", "Error", 5000);
            console.error("Error saving changes:", error);
        }

        semesterList.forEach((s) =>
            s.courses.forEach((c) =>
                console.log(`Saving: ${c.title} (${c.course_id}) -> credits: ${c.credits}`)
            )
        );
    };

    useEffect(() => {
        const fetchDataAfterTokenRefresh = async () => {
            try {
                await props.checkTokenAndRefresh();
                if (!props.token) {
                    setOpenHome(true);
                }
                await getPlan();
            } catch (error) {
                console.error("Error in token refresh or data fetching:", error);
            }
        };

        fetchDataAfterTokenRefresh();
    }, [id, props.token]);

    useEffect(() => {
        const fetchPlanMajor = async () => {
            try {
                await getPlanMajor();
                await getListElectiveField();
            } catch (error) {
                console.error("Error in getting plan major info:", error);
            }
        };
        fetchPlanMajor();
    }, [template]);

    useEffect(() => {
        if (skipSemesterRefresh.current) {
            return; // ✅ Skip refreshing when moveCourse is being processed
        }

        const getDataInPlan = async () => {
            if (currentEditPlan.id) {
                await getTemplate();
                await getListSemesters();
                await getListSeasons();
            }
        };
        getDataInPlan();
    }, [currentEditPlan]); // ✅ Only runs if `currentEditPlan` changes

    // useEffect(() => {
    //     if (currentEditPlan.course_cart.length > 0) {
    //         console.log(
    //             "Fetching course cart after currentEditPlan updated:",
    //             currentEditPlan.course_cart
    //         );
    //         console.log("semesterCourseList", semesterCourseList)
    //
    //     }
    // }, [currentEditPlan.course_cart]); // ✅ Runs only when `course_cart` updates

    useEffect(() => {
        console.log("✅ semesterCourseList updated:", semesterCourseList);
        checkRequirementsFulfilled(false);
    }, [semesterCourseList]);

    // useEffect(() => {
    //     console.log("electiveFieldList", electiveFieldList)
    // }, [electiveFieldList]);

    useEffect(() => {
        if (template && template.requirements) {
            getListRequirements();
            getListMajors();
        } else {
            console.warn("Template is not available yet.");
        }
    }, [template]); // Only runs when `template` changes

    // ✅ Optimize `useEffect` dependencies to avoid infinite loops
    useEffect(() => {
        if (
            !initialRequirementCheck.current &&
            requirementList.length > 0 &&
            semesterList.length > 0
        ) {
            checkRequirementsFulfilled(false); // Initial check without backend update
        }
    }, []); // ✅ Run only once on mount

    useEffect(() => {
        // Prevent unnecessary re-executions
        if (
            JSON.stringify(prevRequirementList.current) !==
            JSON.stringify(requirementList) ||
            JSON.stringify(prevSemesterList.current) !== JSON.stringify(semesterList)
        ) {
            checkRequirementsFulfilled(false);
            prevRequirementList.current = requirementList;
            prevSemesterList.current = semesterList;
        }
    }, [requirementList, semesterList]); // ✅ Runs only when requirementList or semesterList actually change

    // useEffect(() => {
    //     console.log("semesterList", semesterList);
    // }, [semesterList]);

    if (!props.token) {
        return (
            <BackToHome
                openDialog={openHome}
                setOpenDialog={setOpenHome}
                message="Please login first"
            />
        );
    }

    if (openHome) {
        return (
            <BackToHome
                openDialog={openHome}
                setOpenDialog={setOpenHome}
                message="Please login to the owner of this plan first"
            />
        );
    }

    return (
        <div>
            <DndProvider backend={HTML5Backend}>
                <div className="plan-container">
                    <header className="plan-page-header">
                        <div className="plan-title-container">
                            <h2 className="plan-page-title">{currentEditPlan.name}</h2>
                            <div className="plan-details">
                                <div className="plan-major">
                                    Major: {planMajor && planMajor.name ? planMajor.name : "N/A"}
                                </div>
                                <div className="plan-level">
                                    Level: {template ? template.level : ""}
                                </div>
                            </div>
                        </div>
                        <div
                            className="status-icon-container-plan"
                            onMouseEnter={() => setHoveredStatus(id)}
                            onMouseLeave={() => setHoveredStatus(null)}
                        >
                            <div className="plan-subtitle">
                                {currentEditPlan.requirement_filled ? (
                                    <CheckBoxIcon className="status-icon success"/>
                                ) : (
                                    <CancelIcon className="status-icon error"/>
                                )}
                                <div>
                                    {currentEditPlan.requirement_filled
                                        ? "All Requirements fulfilled"
                                        : "Not fulfilled yet"}
                                </div>
                            </div>
                            {hoveredStatus === id && (
                                <div className="status-hover-plan">
                                    <ul>
                                        {template && creditReq ? <li
                                        key={0}
                                        style={{
                                            color: creditReq.filled ? green[500] : red[500], // Use correct MUI color values
                                        }}>
                                            {creditReq.filled ? "✅" : "❌"}
                                            There needs to be at least total of {" "}
                                            <b>{template.min_credits} course credits</b>
                                            {". current plan has "}
                                            <b>{creditReq.count}</b>
                                        </li> : ''}
                                        {template && electReq ? <li
                                            key={1}
                                            style={{
                                                color: electReq.filled ? green[500] : red[500], // Use correct MUI color values
                                            }}>
                                            {electReq.filled ? "✅" : "❌"}
                                            There needs to be at least {" "}
                                            <b>{template.min_each_Elective} credits</b>
                                            {" "}in at least{" "}
                                            <b>{template.min_elective_fields} {electiveFieldList?.[0]
                                                ? `${electiveFieldList[0].type_name}${electiveFieldList[0].type_name.endsWith('s') ? '' : 's'}`
                                                : 'Areas'}
                                            </b>
                                            {". current plan fills "}
                                            <b>{electReq.count}</b>
                                        </li> : ''}
                                        {requirementList.length === 0
                                            ? "No requirement in this template"
                                            : requirementList.map((req) => (
                                                <li
                                                    key={req.id}
                                                    style={{
                                                        color: req.filled ? green[500] : red[500], // Use correct MUI color values
                                                    }}
                                                >
                                                    {req.filled ? "✅" : "❌"}
                                                    {"Courses "}
                                                    <b>{req.include ? "in" : "not in"}</b>{" "}
                                                    {req.major_name}
                                                    {req.attribute && req.attribute !== "" ? (
                                                        <>
                                                            {" where "}
                                                            {req.attribute.replace("_", " ")}{" "}
                                                            {getComparisonLabel(req.attribute_choice)}{" "}
                                                            {req.attribute_value}
                                                            {"'s requirement "}
                                                        </>
                                                    ) : (
                                                        "'s requirement "
                                                    )}
                                                    <b>
                                                        {getComparisonLabel(req.requirement_type)}{" "}
                                                        {req.requirement_size} {req.credit_type_name}
                                                    </b>
                                                    {". current plan has "}
                                                    <b>{req.totalCredits}</b>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </header>
                    <div className="main-section">
                        <div className="grid-layout">
                            {semesterList
                                .slice()
                                // .sort((a, b) => {
                                //     const seasonOrderById = {
                                //         1: 1, // Spring
                                //         2: 2, // Summer
                                //         3: 3, // Fall
                                //         4: 4  // Winter
                                //     };
                                //     // First, sort by year
                                //     if (a.year !== b.year) return a.year - b.year;
                                //
                                //     // Then, sort by season using seasonOrderById
                                //     return (seasonOrderById[a.season] || 5) - (seasonOrderById[b.season] || 5);
                                // })
                                .map((semester) => {
                                    // console.log("semester", semester)
                                    const season = seasonList.find(
                                        (season) => season.id === semester.season
                                    );
                                    return (
                                        <Semester
                                            key={semester.id}
                                            title={`${season ? season.name : "Unknown Season"} ${
                                                semester.year
                                            }`}
                                            courses={
                                                semesterCourseList.find(
                                                    (sem) => sem.semester_id === semester.id
                                                )?.course_list || []
                                            }
                                            moveCourse={moveCourse}
                                            semesterId={semester.id}
                                            semester={semester}
                                            handleEditSemesterClick={handleEditSemesterClick}
                                            majorList={majorList} // Pass majorList
                                            handleDeleteCourse={handleDeleteCourse}
                                            handleDeleteSemester={handleDeleteSemester}
                                            handleUpdateCredit={handleUpdateCredit}
                                            electiveFieldList={electiveFieldList}
                                        />
                                    );
                                })}
                            <div
                                className="semester add-new-plan"
                                style={{backgroundColor: "#f5f5f5"}}
                                onClick={() => {
                                    setOpenDialog(true);
                                    setSemesterFormTitle("Add New Semester");
                                }}
                            >
                                <div className="add-plan-frame">+</div>
                            </div>
                        </div>
                        <div className="course-cart-container">
                            <div className="course-cart">
                                <Semester
                                    title="Course Cart"
                                    courses={courseCart}
                                    moveCourse={moveCourse}
                                    semesterId="coursecart"
                                    semester={undefined}
                                    majorList={majorList}
                                    handleDeleteCourse={handleDeleteCourse}
                                    handleDeleteSemester={handleDeleteSemester}
                                    handleUpdateCredit={handleUpdateCredit}
                                    electiveFieldList={electiveFieldList}
                                />
                            </div>
                            <button className="save-button" onClick={saveChanges}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </DndProvider>
            <Dialog fullWidth open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    <div style={{fontSize: "35px"}}>{semesterFormTitle}</div>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleEditSemester}>
                        {/* Season Selection */}
                        <div style={{paddingTop: "5px", paddingBottom: "15px"}}>
                            <Autocomplete
                                disablePortal
                                options={seasonList} // Keep the object array
                                getOptionLabel={(option) => option.name} // ✅ Extract name as a string
                                value={
                                    seasonList.find((s) => s.id === semesterFormData.season) ||
                                    null
                                } // Ensure proper selection
                                onChange={(e, newValue) => {
                                    setSemesterFormData((prev) => ({
                                        ...prev,
                                        season: newValue ? newValue.id : null, // Store only the ID in formData
                                    }));
                                }}
                                sx={{widfth: "100%"}}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Season"
                                        variant="outlined"
                                        fullWidth
                                        required
                                    />
                                )}
                            />
                        </div>

                        {/* Year Selection */}
                        <div style={{paddingTop: "5px", paddingBottom: "15px"}}>
                            <Autocomplete
                                disablePortal
                                options={yearList}
                                value={semesterFormData.year}
                                getOptionLabel={(option) => option.toString()} // ✅ Convert number to string
                                onChange={(e, newValue) => {
                                    setSemesterFormData((prev) => ({...prev, year: newValue}));
                                }}
                                sx={{width: "100%"}}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Year"
                                        variant="outlined"
                                        fullWidth
                                        required
                                    />
                                )}
                            />
                        </div>

                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Plan;
