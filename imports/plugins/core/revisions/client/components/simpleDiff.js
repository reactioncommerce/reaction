import React, { Component, PropTypes } from "react";

class SimpleDiff extends Component {

  renderDiff() {
    const diff = this.props.diff;

    return diff.map((change, index) => {
      const rightHandSide = change.rhs && change.rhs.toString();
      const leftHandSide = change.lhs && change.lhs.toString();

      switch (change.kind) {
        // Array change
        case "A":
          return (
            <tr className="success" key={index}>
              <td><i className="fa fa-plus"></i></td>
              <td style={{whiteSpace: "normal"}}>{leftHandSide}</td>
              <td style={{whiteSpace: "normal"}}>{rightHandSide}</td>
            </tr>
          );

        // Added property / element
        case "N":
          return (
            <tr className="success" key={index}>
              <td><i className="fa fa-plus"></i></td>
              <td style={{whiteSpace: "normal"}}>{leftHandSide}</td>
              <td style={{whiteSpace: "normal"}}>{rightHandSide}</td>
            </tr>
          );

        // Edited property or element
        case "E":
          return (
            <tr className="warning" key={index}>
              <td><i className="fa fa-pencil"></i></td>
              <td style={{whiteSpace: "normal"}}>{leftHandSide}</td>
              <td style={{whiteSpace: "normal"}}>{rightHandSide}</td>
            </tr>
          );

        // Removed property / element
        case "D":
          return (
            <tr className="danger" key={index}>
              <td><i className="fa fa-times"></i></td>
              <td style={{whiteSpace: "normal"}}>{leftHandSide}</td>
              <td style={{whiteSpace: "normal"}}>{rightHandSide}</td>
            </tr>
          );
        default:
          return null;
      }
    });
  }

  render() {
    return (
      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th></th>
              <th>{"Current"}</th>
              <th>{"Change"}</th>
            </tr>
          </thead>
          <tbody>
            {this.renderDiff()}
          </tbody>
        </table>
      </div>
    );
  }
}

SimpleDiff.defaultProps = {
  diff: []
};

SimpleDiff.propTypes = {
  diff: PropTypes.arrayOf(PropTypes.object)
};

export default SimpleDiff;
