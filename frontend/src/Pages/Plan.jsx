import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import BackToHome from "../Components/BackToHomeDialog";
import axios from "axios";

const Plan = (props) => {
  const [openHome, setOpenHome] = useState(false);

  const [editPlanData, setEditPlanData] = useState({
    credits: null,
    name: "",
    semesters: [],
    course_cart: [],
  });
  const [count, setCount] = useState(0);
  const [editSemesters, setEditSemesters] = useState([]);
  const [openSemesterDialog, setOpenSemesterDialog] = useState(false);
  const [currentEditSemester, setCurrentEditSemester] = useState(false);
  const [currentEditPlan, setCurrentEditPlan] = useState(false);
  const [semesterFormData, setSemesterFormData] = useState({
    id: null,
    year: null,
    season: null,
    classes: [],
    current_credit: null,
    min_credits: null,
    max_credits: null,
  });
  const [courseList, setCourseList] = useState([]);

  const [yearError, setYearError] = useState(false);
  const [seasonError, setSeasonError] = useState(false);

  //   populate page
  const getPlan = async () => {
    axios
      .get("http://localhost:8000/api/plan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setCurrentEditPlan(res);
        setEditPlanData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching plan data", error);
      });
  };

  const getListSemesters = async (plan) => {
    try {
      const semestersData = await Promise.all(
        plan.semesters.map(async (semesterId) => {
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

            const semester = semesterResponse.data;

            // Fetch courses for the semester
            const courseData = await Promise.all(
              semester.classes.map(async (courseId) => {
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
                  return null; // Return null for failed course fetches
                }
              })
            );

            return {
              ...semester,
              courses: courseData.filter((course) => course !== null),
            };
          } catch (error) {
            console.error("Error fetching semester:", semesterId, error);
            return null;
          }
        })
      );

      // Filter out any null semesters (failed fetches)
      const validSemesters = semestersData.filter(
        (semester) => semester !== null
      );
      setEditSemesters(validSemesters);

      // Extract and update the course list
      const allCourses = validSemesters.flatMap((semester) => semester.courses);
      setCourseList(allCourses);
    } catch (error) {
      console.error("Error fetching semesters data", error);
    }
  };

  const getListCourses = async (plan) => {
    try {
      const coursesData = await Promise.all(
        plan.course_cart.map(async (courseId) => {
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
      setCourseList((prevCourses) => [
        ...prevCourses,
        ...coursesData.filter((course) => course !== null),
      ]);
    } catch (error) {
      console.error("Error fetching courses cart data", error);
    }
  };
  //   toggle edit semester dialog
  const handleEditSemesterClick = (semester) => {
    setSemesterFormData({
      id: semester.id || null,
      year: semester.year || null,
      season: semester.season || null,
      classes: semester.classes || [],
      current_credit: semester.current_credit || null,
      min_credits: semester.min_credits || null,
      max_credits: semester.max_credits || null,
    });
    setCurrentEditSemester(semester);
    setOpenSemesterDialog(true);
  };

  const handleCloseSemesterdialog = () => {
    setOpenSemesterDialog(false);
    setSemesterFormData({
      id: null,
      year: null,
      season: null,
      classes: [],
      current_credit: null,
      min_credits: null,
      max_credits: null,
    });
  };

  const handleClickOpenSemester = () => {
    setOpenSemesterDialog(true);
  };

  const handleSubmitSemester = async (e) => {
    e.preventDefault();
    if (semesterFormData.year === null) {
      setYearError(true);
      return;
    }
    if (semesterFormData.season === null) {
      setSeasonError(true);
      return;
    }

    const method = currentEditSemester ? "put" : "post";
    const url = currentEditSemester
      ? `http://localhost:8000/api/semester/${currentEditSemester.id}/`
      : "http://localhost:8000/api/semester/";

    try {
      await props.checkTokenAndRefresh();
      const response = await axios[method](url, semesterFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      let newSemesterId = response.data.id;
      const updatedSemesters = [...editPlanData.data.semester, newSemesterId];
      // from Templates line 440
      await axios.put(
        `http://localhost:8000/api/plan/${currentEditPlan.id}/`,
        {
          ...currentEditPlan.data,
          requirements: updatedSemesters,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      await getListSemesters();
      await getListCourses();
    } catch (error) {
      console.error("Error submitting semester data:", error);
    }
  };

  //   edit course location (semester or cart)

  //   save edit
  const handleSaveEditPlan = async () => {
    // go through every semester object in editSemesters and save the changes to backend
    editSemesters.forEach(async (semester) => {
      try {
        await axios.put(
          `http://localhost:8000/api/semester/${semester.id}`,
          semester,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
      } catch (error) {
        console.error("Error saving semester data", error);
        return;
      }
    });
    try {
      await axios.put(
        `http://localhost:8000/api/plan/${props.planId}`,
        editPlanData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error saving plan data", error);
      return;
    }
  };

  //   the props should send back
  //   checkTokenAndRefresh to check for token refreshes
  //   token to check if user is logged in, if not send back to home
  //   userDetails so that we can check if id of current plan is in the user's plan list
  //   loadingPlan to check if the page is currently loading
  //   plan id to compare with the plan list in userDetails, then to be used to fetch plan object
  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      if (openSemesterDialog) {
        setOpenSemesterDialog(true);
      }
      try {
        // Wait for checkTokenAndRefresh to finish
        await props.checkTokenAndRefresh();
        if (!props.token) {
          setOpenHome(true); // Open dialog if no token is available
        }
        await getPlan();
        getListSemesters();
        getListCourses();
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    // Run the async function
    fetchDataAfterTokenRefresh();

    // Empty dependency array ensures this only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSemesterDialog]);

  if (!props.token) {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="Please login first"
      />
    );
  }

  if (props.loadingPlan) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    ); // Show loading indicator while fetching user details
  }

  if (
    props.userDetails.plans.filter((plan) => {
      return plan.id === props.planId;
    }).length === 0
  ) {
    return (
      <BackToHome
        openDialog={openHome}
        setOpenDialog={setOpenHome}
        message="You are not authorized to edit this plan. Only the owner of this plan can edit it."
      />
    );
  }

  return (
    <div className="home_container">
      <header>
        <h1 className="dashboard_title">
          {props.userDetails.user.username}'s Dashboard
        </h1>
        <p className="home_description">
          total number of plans: {props.userDetails.plans.length}
        </p>
      </header>
    </div>
  );
};

export default Plan;
