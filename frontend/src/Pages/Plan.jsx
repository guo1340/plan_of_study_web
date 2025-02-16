import React, { useState, useEffect } from "react";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import BackToHome from "../Components/BackToHomeDialog";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "CARD";

const Course = ({ id, text, moveCourse }) => {
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
      {text}
    </div>
  );
};

const Semester = ({ title, courses, moveCourse, semesterId }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item) => moveCourse(item.id, semesterId),
  }));

  return (
    <div ref={drop} className="semester course-cart-color course-cart-scroll">
      <div className="semester-header course-cart-color">
        <h3>{title}</h3>
        <span className="credits">Credits: 0</span>
      </div>
      {courses.map((course) => (
        <Course key={course.id} id={course.id} text={course.text} moveCourse={moveCourse} />
      ))}
    </div>
  );
};

const Plan = (props) => {
  const { id } = useParams();
  const [openHome, setOpenHome] = useState(false);

  // Hardcoded semester and course data similar to App.jsx
  const [semesters, setSemesters] = useState({
    semester1: [
      { id: 1, text: "Course 1" },
      { id: 2, text: "Course 2" },
    ],
    semester2: [{ id: 3, text: "Course 3" }],
    semester3: [{ id: 4, text: "Course 4" }],
    semester4: [],
    semester5: [{ id: 5, text: "Course 5" }, { id: 6, text: "Course 6" }],
    coursecart: [
      { id: 7, text: "CS 1704 \n Software Engineering" },
      { id: 8, text: "CS 2704 \n Intro to Software Engineering" },
      { id: 9, text: "CS 3704 \n Software Engineering" },
      { id: 10, text: "CS 4704 \n Software Engineering" },
      { id: 11, text: "CS 4714 \n Software Engineering" },
      { id: 12, text: "CS 4724 \n Software Engineering" },
      { id: 13, text: "CS 4734 \n Software Engineering" },
    ],
  });

  const moveCourse = (courseId, targetSemester) => {
    setSemesters((prevSemesters) => {
      let movedCourse = null;
      let sourceSemester = null;

      const newSemesters = Object.keys(prevSemesters).reduce((acc, key) => {
        acc[key] = [...prevSemesters[key]];
        return acc;
      }, {});

      Object.keys(newSemesters).forEach((key) => {
        newSemesters[key] = newSemesters[key].filter((course) => {
          if (course.id === courseId) {
            movedCourse = course;
            sourceSemester = key;
            return false;
          }
          return true;
        });
      });

      if (movedCourse && sourceSemester !== targetSemester) {
        newSemesters[targetSemester] = [...newSemesters[targetSemester], movedCourse];
      }

      return newSemesters;
    });
  };

  useEffect(() => {
    const fetchDataAfterTokenRefresh = async () => {
      try {
        await props.checkTokenAndRefresh();
        if (!props.token) {
          setOpenHome(true);
        }
      } catch (error) {
        console.error("Error in token refresh or data fetching:", error);
      }
    };

    fetchDataAfterTokenRefresh();
  }, [id, props.token]);

  if (!props.token) {
    return <BackToHome openDialog={openHome} setOpenDialog={setOpenHome} message="Please login first" />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="plan-container">
        <header className="plan-page-header">
          <h2 className="plan-page-title">Plan No.1</h2>
          <p className="plan-subtitle">Requirements Filled <CancelIcon className="status-icon error" /></p>
        </header>
        <div className="main-section">
          <div className="grid-layout">
            <Semester title="Fall 2024" courses={semesters.semester1} moveCourse={moveCourse} semesterId="semester1" />
            <Semester title="Spring 2024" courses={semesters.semester2} moveCourse={moveCourse} semesterId="semester2" />
            <Semester title="Fall 2025" courses={semesters.semester3} moveCourse={moveCourse} semesterId="semester3" />
            <Semester title="Spring 2026" courses={semesters.semester4} moveCourse={moveCourse} semesterId="semester4" />
            <Semester title="Fall 2026" courses={semesters.semester5} moveCourse={moveCourse} semesterId="semester5" />
          </div>
          <div className="course-cart-container">
            <div className="course-cart">
              <Semester title="Course Cart" courses={semesters.coursecart} moveCourse={moveCourse} semesterId="coursecart" />
            </div>
            <button className="save-button">Save</button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Plan;
