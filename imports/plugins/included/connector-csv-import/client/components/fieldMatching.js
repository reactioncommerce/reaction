import React, { Component } from "react";
import FieldMatchingColumn from "./fieldMatchingColumn";

class FieldMatching extends Component {
  renderFieldMatchingColumns() {
    const { header, sampleData, fieldOptions, selectedMapping, matchFields } = this.props;
    return sampleData.map((column, index) => {
      const colTitle = header[index] !== undefined ? header[index] : `Column ${index + 1}`;
      return (
        <FieldMatchingColumn
          key={colTitle}
          colData={column}
          colTitle={colTitle}
          fieldOptions={fieldOptions}
          matchFields={matchFields}
          selectedField={selectedMapping[colTitle] !== "undefined" ? selectedMapping[colTitle] : "ignore"}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <h3>Match the fields.</h3>
        {this.renderFieldMatchingColumns()}
      </div>
    );
  }
}

export default FieldMatching;
