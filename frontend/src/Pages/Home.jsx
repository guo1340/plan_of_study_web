import React from "react";

const Home = ({ token }) => {
  return (
    <div className="home_container">
      <header>
        <h1 className="welcome_message">Welcome!</h1>
        <p className="home_description">
          {" "}
          ​Current plan of study resources are outdated, have limited
          visibility, and lack of adaptability to individual student's needs.{" "}
        </p>
        <p className="home_description2"> We're here to fix that.</p>
      </header>
    </div>
  );
};

export default Home;
