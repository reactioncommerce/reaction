import React, { Component } from "react";
import { Components } from "@reactioncommerce/reaction-components";

class FieldMatchingColumn extends Component {
  renderSampleData() {
    const { colData, colTitle } = this.props;
    return colData.map((item) => (
      <tr key={`${colTitle}-${item}`}>
        <td colSpan="2">{item}</td>
      </tr>
    ));
  }

  handleSelectChange = (value, field) => {
    this.props.matchFields(value, field);
  }

  render() {
    const { fieldOptions, colTitle, selectedField } = this.props;
    return (
      <table className="table table-bordered table-striped">
        <tbody>
          <tr key={`colTitle-${colTitle}`}>
            <td width="50%"><strong>{colTitle}</strong></td>
            <td width="50%">
              <Components.Select
                clearable={false}
                name={colTitle}
                onChange={this.handleSelectChange}
                options={fieldOptions}
                value={selectedField}
              />
            </td>
          </tr>
          {this.renderSampleData()}
        </tbody>
      </table>
    );
  }
}

export default FieldMatchingColumn;
