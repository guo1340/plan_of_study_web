import React from "react";
import axios from "axios";

export default class Courses extends React.Component {
  state = {
    classes: [],
  };

  componentDidMount() {
    axios
      .get("http://localhost:8000/api/classes/")
      .then((res) => {
        const data = res.data;
        this.setState({ classes: data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="home_container">
        <table>
          <thead>
            <tr>
              <th scope="col">Course Name</th>
              <th scope="col">Major</th>
              <th scope="col">Pre-requesite</th>
              <th scope="col">Term</th>
              <th scope="col">Co-Requesite</th>
              <th scope="col">Credits</th>
              <th scope="col">Elective Field</th>
            </tr>
          </thead>
          <tbody>
            {this.state.classes.map((output, id) => (
              <tr>
                <th scope="row">{output.abbreviation}</th>
                <td>{output.major}</td>
                <td>{output.prereq}</td>
                <td>{output.term}</td>
                <td>{output.coreq}</td>
                <td>{output.credits}</td>
                <td>{output.elective_field_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
