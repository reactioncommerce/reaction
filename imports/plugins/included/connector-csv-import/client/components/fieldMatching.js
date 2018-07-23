import React, { Component } from "react";
import FieldMatchingColumn from "./fieldMatchingColumn";

class FieldMatching extends Component {
  renderFieldMatchingColumns() {
    const { header, sampleData } = this.props;
    return sampleData.map((column, index) => (
      <FieldMatchingColumn
        colData={column}
        colTitle={header[index] !== undefined ? header[index] : `Column ${index + 1}`}
      />
    ));
  }
  render() {
    return (
      <div>
        <p>Match the fields.</p>
        {this.renderFieldMatchingColumns()}
      </div>
    );
  }
}

export default FieldMatching;
