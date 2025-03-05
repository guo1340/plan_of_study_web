import React, {useState, useEffect, useRef} from "react";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import BackToHome from "../Components/BackToHomeDialog";
import axios from "axios";
import {useParams} from "react-router-dom";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {NotificationManager} from "react-notifications";
import {green, red} from "@mui/material/colors";
import {AiOutlineEdit} from "react-icons/ai";

const ItemType = "CARD";

const Course = ({ id, course, moveCourse, majorList }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const majorAbbr = majorList[course.major] || "N/A"; // Lookup abbreviation

    return (
        <div
            ref={drag}
            className="course-item"
            style={{ opacity: isDragging ? 0.5 : 1, whiteSpace: "pre-line" }}
        >
            {majorAbbr} {course.class_number} {/* Display abbreviation before class number */}
        </div>
    );
};


const Semester = ({title, courses, moveCourse, semesterId, semester, handleEditSemesterClick, majorList}) => {
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

    return (
        <div ref={drop} className="semester course-cart-color course-cart-scroll">
            <div className="semester-header course-cart-color">
                <div style={{display: "flex"}}>
                    <h3>{title}</h3>
                    {title !== "Course Cart" && <Button
                        sx={{color: "black", maxWidth: "20px"}}
                        onClick={() => handleEditSemesterClick(semester)}>
                        <AiOutlineEdit/>
                    </Button>}
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
    const [semesterFormTitle, setSemesterFormTitle] = useState("")

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

    const getPlan = async () => {
        console.log("get plan");
        try {
            const res = await axios.get(`http://localhost:8000/api/plan/${id}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            // console.log("Fetched Plan:", res.data); // ✅ Debugging step
            setCurrentEditPlan((prevState) => ({
                ...prevState,
                ...res.data,
                course_cart: res.data.course_cart || [],
                semesters: res.data.semesters || [],
            }));

            const plan = res.data
            setEditPlanData(plan);
            setCourseCart(plan.course_cart)
        } catch (error) {
            if (error.response && error.response.status === 500) {
                console.error("Server error (500) encountered. Redirecting home...");
                setOpenHome(true); // ✅ Trigger the home dialog
            } else {
                console.error("Error fetching plan data", error);
            }
        }
    };

    const getListMajors = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/major/");
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
        console.log("get requirement list");

        const requirementsData = await Promise.all(
            template.requirements.map(async (requirement_id) => {
                try {
                    const requirementResponse = await axios.get(
                        `http://localhost:8000/api/requirement/${requirement_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        }
                    );
                    const requirement = requirementResponse.data;
                    // Fetch the major object for the requirement
                    const majorResponse = await axios.get(
                        `http://localhost:8000/api/major/${requirement.major}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        }
                    );
                    requirement.major_name = majorResponse.data.name; // Attach major name to requirement

                    // Fetch the credit type object for the requirement
                    const creditTypeResponse = await axios.get(
                        `http://localhost:8000/api/credit-type/${requirement.credit_type}`,
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
        console.log("get template");
        try {
            const res = await axios.get(
                `http://localhost:8000/api/template/${editPlanData.template}`,
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

    const getListSemesters = async () => {
        console.log("get semester list");
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
                            `http://localhost:8000/api/semester/${semesterId}/`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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

            setSemesterList(validSemesters);

            setSemesterCourseList(
                validSemesters.map((semester) => ({
                    semester_id: semester.id,
                    course_list: semester.courses || [], // ✅ Ensures course_list is always an array
                }))
            );

            console.log("Updated semesterList:", validSemesters);
        } catch (error) {
            console.error("Error fetching semesters data", error);
        }
    };

    const getListSeasons = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/season/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
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

        const allRequirementsMet = updatedRequirements.every((req) => req.filled);

        // ✅ Prevent unnecessary `setState` updates
        setCurrentEditPlan((prevPlan) =>
            prevPlan.requirement_filled === allRequirementsMet
                ? prevPlan
                : {...prevPlan, requirement_filled: allRequirementsMet}
        );

        console.log("Updated requirements:", updatedRequirements);
        console.log("Requirement fulfillment status:", allRequirementsMet);

        // ✅ Only update backend if:
        // - The user explicitly saves (`shouldUpdateBackend` is true)
        // - The initial page load needs it (`initialRequirementCheck.current` is false)
        if (shouldUpdateBackend || !initialRequirementCheck.current) {
            try {
                await axios.put(
                    `http://localhost:8000/api/plan/${currentEditPlan.id}/`,
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
        })
        setSemesterFormTitle("Edit Semester");
        setCurrentEditSemester(semester);
        setOpenDialog(true);
    }

    // Need fixing
    const moveCourse = (courseId, targetSemesterId) => {
        skipSemesterRefresh.current = true; // ✅ Prevent useEffect from running

        console.log(`Moving course ${courseId} to semester ${targetSemesterId}`);

        setSemesterCourseList((prevSemesterCourseList) => {
            const updatedSemesterCourseList = prevSemesterCourseList.map((sc) => ({
                ...sc,
                course_list: [...sc.course_list],
            }));

            let movedCourse = null;
            let previousSemesterId = "coursecart";

            // Find and remove the course from its current location
            for (let semesterData of updatedSemesterCourseList) {
                const courseIndex = semesterData.course_list.findIndex(
                    (course) => course.course_id === courseId
                );
                if (courseIndex !== -1) {
                    movedCourse = semesterData.course_list[courseIndex];
                    previousSemesterId = semesterData.semester_id;
                    if (previousSemesterId !== targetSemesterId) {
                        semesterData.course_list.splice(courseIndex, 1);
                    }
                    break;
                }
            }

            if (!movedCourse) {
                setCourseCart((prevCourseCart) => {
                    const updatedCourseCart = [...prevCourseCart];
                    const cartIndex = updatedCourseCart.findIndex(
                        (course) => course.course_id === courseId
                    );
                    if (cartIndex !== -1) {
                        movedCourse = updatedCourseCart[cartIndex];
                        previousSemesterId = "coursecart";
                        if (previousSemesterId !== targetSemesterId) {
                            updatedCourseCart.splice(cartIndex, 1);
                        }

                    }
                    return updatedCourseCart;
                });

                setCurrentEditPlan((prevCurrentEditPlan) => ({
                    ...prevCurrentEditPlan,
                    course_cart: prevCurrentEditPlan.course_cart.filter(
                        (id) => id !== courseId
                    ),
                }));
            }

            if (!movedCourse) {
                console.error(`Error: Course ${courseId} not found.`);
                return updatedSemesterCourseList;
            }

            // Prevent redundant moves
            if (previousSemesterId === targetSemesterId) {
                console.warn("Move ignored: Course is already in the target location.");
                return updatedSemesterCourseList;
            }

            movedCourse.previousSemester = previousSemesterId;
            movedCourse.currentSemester = targetSemesterId;

            if (targetSemesterId === "coursecart") {
                setCourseCart((prevCourseCart) => [...prevCourseCart, movedCourse]);
                setCurrentEditPlan((prevCurrentEditPlan) => ({
                    ...prevCurrentEditPlan,
                    course_cart: [...prevCurrentEditPlan.course_cart, movedCourse.course_id],
                }));
            } else {
                const targetEntry = updatedSemesterCourseList.find(
                    (entry) => entry.semester_id === targetSemesterId
                );
                if (targetEntry) {
                    targetEntry.course_list.push(movedCourse);
                } else {
                    updatedSemesterCourseList.push({
                        semester_id: targetSemesterId,
                        course_list: [movedCourse],
                    });
                }
            }

            setSemesterList((prevSemesterList) => {
                const updatedSemesterList = prevSemesterList.map((semester) => ({
                    ...semester,
                    courses: [...semester.courses],
                    classes: [...semester.classes],
                }));

                if (previousSemesterId !== "coursecart") {
                    const prevSemester = updatedSemesterList.find(
                        (sem) => sem.id === previousSemesterId
                    );
                    if (prevSemester) {
                        prevSemester.courses = prevSemester.courses.filter(
                            (course) => course.course_id !== courseId
                        );
                        prevSemester.classes = prevSemester.classes.filter(
                            (id) => id !== courseId
                        );
                    }
                }

                if (targetSemesterId !== "coursecart") {
                    const newSemester = updatedSemesterList.find(
                        (sem) => sem.id === targetSemesterId
                    );
                    if (newSemester) {
                        newSemester.courses.push(movedCourse);
                        newSemester.classes.push(movedCourse.course_id);
                    } else {
                        updatedSemesterList.push({
                            id: targetSemesterId,
                            courses: [movedCourse],
                            classes: [movedCourse.course_id],
                        });
                    }
                }

                return updatedSemesterList;
            });

            // console.log(
            //   "Updated semester list after move:",
            //   updatedSemesterCourseList
            // );

            setTimeout(() => {
                skipSemesterRefresh.current = false; // ✅ Reset flag after changes apply
            }, 100); // Small delay ensures updates settle before next render

            return updatedSemesterCourseList;
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
                ? `http://localhost:8000/api/semester/${currentEditSemester.id}/` // If editing, use the course ID
                : "http://localhost:8000/api/semester/";
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
            await getListSemesters();
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
    const saveChanges = async (e) => {
        e.preventDefault();
        await props.checkTokenAndRefresh();

        try {
            // Update each semester with full course objects in `classes`
            await Promise.all(
                semesterList.map(async (semester) => {
                    try {
                        await axios.put(
                            `http://localhost:8000/api/semester/${semester.id}/`,
                            {
                                id: semester.id,
                                classes: semester.courses, // ✅ Send full course objects instead of just IDs
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                },
                            }
                        );
                        console.log(`Semester ${semester.id} updated successfully`);
                    } catch (semesterError) {
                        console.error(
                            `Error updating semester ${semester.id}:`,
                            semesterError
                        );
                    }
                })
            );

            // Update the plan with full `course_cart` objects
            await axios.put(
                `http://localhost:8000/api/plan/${id}/`,
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
    };

    useEffect(() => {
        const fetchDataAfterTokenRefresh = async () => {
            try {
                await props.checkTokenAndRefresh();
                if (!props.token) {
                    setOpenHome(true);
                }
                await getPlan();
                await getListMajors();
            } catch (error) {
                console.error("Error in token refresh or data fetching:", error);
            }
        };

        fetchDataAfterTokenRefresh();
    }, [id, props.token]);

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

    useEffect(() => {
        if (currentEditPlan.course_cart.length > 0) {
            console.log(
                "Fetching course cart after currentEditPlan updated:",
                currentEditPlan.course_cart
            );
        }
    }, [currentEditPlan.course_cart]); // ✅ Runs only when `course_cart` updates

    useEffect(() => {
        if (template && template.requirements) {
            getListRequirements();
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
                        <h2 className="plan-page-title">{currentEditPlan.name}</h2>
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
                            {semesterList.map((semester) => {
                                const season = seasonList.find(
                                    (season) => season.id === semester.season
                                );
                                return (
                                    <Semester
                                        key={semester.id}
                                        title={`${season ? season.name : "Unknown Season"} ${semester.year}`}
                                        courses={
                                            semesterCourseList.find((sem) => sem.semester_id === semester.id)
                                                ?.course_list || []
                                        }
                                        moveCourse={moveCourse}
                                        semesterId={semester.id}
                                        semester={semester}
                                        handleEditSemesterClick={handleEditSemesterClick}
                                        majorList={majorList} // Pass majorList
                                    />
                                );
                            })}
                            <div
                                className="semester add-new-plan"
                                style={{backgroundColor: "#f5f5f5"}}
                                onClick={() => {
                                    setOpenDialog(true)
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
