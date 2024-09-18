import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/", {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        });
        if (response.status === 200) {
          setUser(response.data[0].user); // Set the user data from the response
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // setLoading(false); // Set loading to false even in case of an error
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    if (token) {
      fetchUser(); // Fetch the user if the token is available
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home_container">
      <header>
        <h1 className="welcome_message">
          Welcome {user ? user.username : "Guest"}! Here is your Dashboard
        </h1>
        <p className="home_description">nothing is in here yet</p>
      </header>
    </div>
  );
};

export default Dashboard;
