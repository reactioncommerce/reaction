import React, { Component } from "react";

class FieldMatchingColumn extends Component {
  render() {
    const { colData, colTitle } = this.props;
    const renderSampleData = colData.map((item) => (
      <p>{item}</p>
    ));
    return (
      <div>
        <p><strong>{colTitle}</strong></p>
        {renderSampleData}
      </div>
    );
  }
}

export default FieldMatchingColumn;
