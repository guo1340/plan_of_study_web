import React, { useState, useEffect, useRef } from "react";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import BackToHome from "../Components/BackToHomeDialog";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  radioGroupClasses,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { NotificationManager } from "react-notifications";

const ItemType = "CARD";

const Course = ({ id, course, moveCourse }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="course-item"
      style={{ opacity: isDragging ? 0.5 : 1, whiteSpace: "pre-line" }}
    >
      {course.class_number}
    </div>
  );
};

const Semester = ({ title, courses, moveCourse, semesterId }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item) => moveCourse(item.id, semesterId), // Ensure a valid drop happens
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // console.log("courses", courses);

  return (
    <div ref={drop} className="semester course-cart-color course-cart-scroll">
      <div className="semester-header course-cart-color">
        <h3>{title}</h3>
        <span className="credits">Credits: 0</span>
      </div>
      {courses.map((course) => (
        <Course
          key={course.id}
          id={course.id}
          course={course}
          moveCourse={moveCourse}
        />
      ))}
    </div>
  );
};

const Plan = (props) => {
  const { id } = useParams();
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
  const [semesterCourseList, setSemesterCourseList] = useState([]);
  const [courseCart, setCourseCart] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [seasonList, setSeasonList] = useState([]);
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: 10 }, (_, i) => currentYear + i); // Generate years
  const [semesterFormData, setSemesterFormData] = useState({
    plan: id,
    season: null,
    year: null,
  });
  const [currentEditSemester, setCurrentEditSemester] = useState(null);
  const skipSemesterRefresh = useRef(false);

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

      setEditPlanData(res.data);
    } catch (error) {
      console.error("Error fetching plan data", error);
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
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            return semesterResponse.data;
          } catch (error) {
            console.error("Error fetching semester:", semesterId, error);
            return null;
          }
        })
      );

      const validSemesters = semestersData.filter(
        (semester) => semester !== null
      );

      // Fetch courses for each semester
      const semesterCourses = await Promise.all(
        validSemesters.map(async (semester) => {
          const currSemesterCourseList = await Promise.all(
            semester.classes.map(async (courseId) => {
              try {
                const courseResponse = await axios.get(
                  `http://localhost:8000/api/classes/${courseId}/`
                );
                return courseResponse.data;
              } catch (error) {
                console.error("Error fetching course data", error);
                return null;
              }
            })
          );
          return {
            semester_id: semester.id,
            course_list: currSemesterCourseList.filter(
              (course) => course !== null
            ),
          };
        })
      );

      // ✅ First update semesterCourseList
      setSemesterCourseList(semesterCourses);

      // ✅ Then update semesterList after course data is ready
      setSemesterList(
        validSemesters.map((sem) => ({
          ...sem,
          courses:
            semesterCourses.find((sc) => sc.semester_id === sem.id)
              ?.course_list || [],
        }))
      );

      // console.log("Updated semesterCourseList:", semesterCourses);
      // console.log("Updated semesterList:", semesterList);
    } catch (error) {
      console.error("Error fetching semesters data", error);
    }
  };

  const getCourseCart = async () => {
    try {
      if (
        !id ||
        !currentEditPlan.course_cart ||
        currentEditPlan.course_cart.length === 0
      ) {
        console.warn(
          "Skipping course cart fetch: No course_cart data in currentEditPlan"
        );
        return;
      }

      console.log(
        "Fetching courses for course_cart:",
        currentEditPlan.course_cart
      );

      const coursesData = await Promise.all(
        currentEditPlan.course_cart.map(async (courseId) => {
          try {
            const courseResponse = await axios.get(
              `http://localhost:8000/api/classes/${courseId}/`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            return courseResponse.data;
          } catch (error) {
            console.error(`Error fetching course ${courseId}:`, error);
            return null;
          }
        })
      );

      console.log(
        "Fetched courseCart data:",
        coursesData.filter((course) => course !== null)
      );

      setCourseCart(coursesData.filter((course) => course !== null)); // ✅ Set only valid courses
    } catch (error) {
      console.error("Error fetching courses cart data", error);
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

  // Need fixing
  const moveCourse = (courseId, targetSemesterId) => {
    // Set the flag to skip the semester refresh triggered by currentEditPlan changes.
    skipSemesterRefresh.current = true;
    console.log(`Moving course ${courseId} to semester ${targetSemesterId}`);

    // Update the semesterCourseList using a functional state update so that we work with the latest state.
    setSemesterCourseList((prevSemesterCourseList) => {
      // Create a deep copy of the previous semester course list.
      const updatedSemesterCourseList = prevSemesterCourseList.map((sc) => ({
        ...sc,
        course_list: [...sc.course_list],
      }));

      let movedCourse = null;
      // Correctly set initial previousSemesterId as "coursecart"
      let previousSemesterId = "coursecart";

      // Look for the course in the semester lists.
      for (let semesterData of updatedSemesterCourseList) {
        const courseIndex = semesterData.course_list.findIndex(
          (course) => course.id === courseId
        );
        if (courseIndex !== -1) {
          movedCourse = semesterData.course_list[courseIndex];
          previousSemesterId = semesterData.semester_id;
          // Remove the course from this semester.
          semesterData.course_list.splice(courseIndex, 1);
          break;
        }
      }

      // If the course wasn’t found in any semester, update the course cart.
      if (!movedCourse) {
        setCourseCart((prevCourseCart) => {
          const updatedCourseCart = [...prevCourseCart];
          const cartIndex = updatedCourseCart.findIndex(
            (course) => course.id === courseId
          );
          if (cartIndex !== -1) {
            movedCourse = updatedCourseCart[cartIndex];
            // Use "coursecart" consistently here.
            previousSemesterId = "coursecart";
            updatedCourseCart.splice(cartIndex, 1);
          } else {
            console.error(
              `Error: Course ${courseId} not found in any semester or course cart.`
            );
          }
          return updatedCourseCart;
        });
        // Remove the course id from currentEditPlan.course_cart as well.
        setCurrentEditPlan((prevCurrentEditPlan) => ({
          ...prevCurrentEditPlan,
          course_cart: prevCurrentEditPlan.course_cart.filter(
            (id) => id !== courseId
          ),
        }));
      }

      console.log("previousSemesterId:", previousSemesterId);
      console.log("targetSemesterId:", targetSemesterId);
      console.log("movedCourse:", movedCourse);

      // Prevent redundant moves.
      if (previousSemesterId === targetSemesterId) {
        console.warn("Move ignored: Course is already in the target location.");
        return updatedSemesterCourseList;
      }

      // Update the course object to reflect its move.
      movedCourse.previousSemester = previousSemesterId;
      movedCourse.currentSemester = targetSemesterId;

      // Add the course to the target location.
      if (targetSemesterId === "coursecart") {
        // Update the course cart.
        setCourseCart((prevCourseCart) => [...prevCourseCart, movedCourse]);
        // Update the current edit plan.
        setCurrentEditPlan((prevCurrentEditPlan) => ({
          ...prevCurrentEditPlan,
          course_cart: [...prevCurrentEditPlan.course_cart, movedCourse.id],
        }));
      } else {
        // Find or create the entry for the target semester.
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

      console.log(
        "After moving (updated semester list):",
        updatedSemesterCourseList
      );
      return updatedSemesterCourseList;
    });
  };

  const handleAddSemester = async (e) => {
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
    } else {
      const method = currentEditSemester ? "put" : "post";
      const url = currentEditSemester
        ? `http://localhost:8000/api/semester/${currentEditSemester.id}/` // If editing, use the course ID
        : "http://localhost:8000/api/semester/";
      await props.checkTokenAndRefresh();
      try {
        await axios[method](url, semesterFormData, {
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
    });
    setOpenDialog(false);
    setCurrentEditSemester(null);
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
    if (skipSemesterRefresh.current) {
      skipSemesterRefresh.current = false;
      return;
    }
    // console.log("Updated currentEditPlan:", currentEditPlan);
    const getDataInPlan = async () => {
      if (currentEditPlan.id) {
        await getListSemesters();
        await getListSeasons();
      }
    };
    getDataInPlan();
  }, [currentEditPlan]);

  useEffect(() => {
    if (currentEditPlan.course_cart.length > 0) {
      console.log(
        "Fetching course cart after currentEditPlan updated:",
        currentEditPlan.course_cart
      );
      getCourseCart();
    }
  }, [currentEditPlan.course_cart]); // ✅ Runs only when `course_cart` updates

  if (!props.token) {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="Please login first"
      />
    );
  }

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <div className="plan-container">
          <header className="plan-page-header">
            <h2 className="plan-page-title">{currentEditPlan.name}</h2>
            <div className="plan-subtitle">
              {currentEditPlan.requirement_filled ? (
                <CheckBoxIcon className="status-icon success" />
              ) : (
                <CancelIcon className="status-icon error" />
              )}
              <div>
                {currentEditPlan.requirement_filled
                  ? "All Requirements fulfilled"
                  : "Not fulfilled yet"}
              </div>
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
                  />
                );
              })}

              {/* <Semester
                title="Fall 2024"
                courses={semesters.semester1}
                moveCourse={moveCourse}
                semesterId="semester1"
              />
              <Semester
                title="Spring 2024"
                courses={semesters.semester2}
                moveCourse={moveCourse}
                semesterId="semester2"
              />
              <Semester
                title="Fall 2025"
                courses={semesters.semester3}
                moveCourse={moveCourse}
                semesterId="semester3"
              />
              <Semester
                title="Spring 2026"
                courses={semesters.semester4}
                moveCourse={moveCourse}
                semesterId="semester4"
              />
              <Semester
                title="Fall 2026"
                courses={semesters.semester5}
                moveCourse={moveCourse}
                semesterId="semester5"
              /> */}
              <div
                className="semester add-new-plan"
                style={{ backgroundColor: "#f5f5f5" }}
                onClick={() => setOpenDialog(true)}
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
                />
              </div>
              <button className="save-button">Save</button>
            </div>
          </div>
        </div>
      </DndProvider>
      <Dialog fullWidth open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          <div style={{ fontSize: "35px" }}>Add Semester</div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddSemester}>
            {/* Season Selection */}
            <div style={{ paddingTop: "5px", paddingBottom: "15px" }}>
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
                sx={{ width: "100%" }}
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
            <div style={{ paddingTop: "5px", paddingBottom: "15px" }}>
              <Autocomplete
                disablePortal
                options={yearList}
                value={semesterFormData.year}
                getOptionLabel={(option) => option.toString()} // ✅ Convert number to string
                onChange={(e, newValue) => {
                  setSemesterFormData((prev) => ({ ...prev, year: newValue }));
                }}
                sx={{ width: "100%" }}
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
