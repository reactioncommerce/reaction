import React, { Component } from "react";
import PropTypes from "prop-types";
import { getFieldOptionsForCollection } from "@reactioncommerce/reaction-import-connectors";
import { Components } from "@reactioncommerce/reaction-components";
import Button from "@reactioncommerce/components/Button/v1";
import FieldMatchingColumn from "./fieldMatchingColumn";

class MappingScreen extends Component {
  constructor(props) {
    super(props);
    const { importJob, selectedMapping } = props;
    let fieldOptions = [];
    if (importJob.collection) {
      fieldOptions = getFieldOptionsForCollection(importJob.collection);
    }
    this.state = {
      errorMessages: [],
      fieldOptions,
      fieldMappingByUser: selectedMapping,
      newMappingName: ""
    };
  }

  handleDoneButtonClick = () => {
    const { header, importJob, sampleData } = this.props;
    const { newMappingName, fieldMappingByUser } = this.state;
    const errorMessages = [];
    if (this.props.importJob.importMapping === "create" && !newMappingName) {
      errorMessages.push("Please provide a name for the new mapping template.");
    }
    for (let colNumber = 0; colNumber < sampleData.length; colNumber += 1) {
      let mappingKey = `${colNumber}`;
      let colTitle = `${colNumber + 1}`;
      if (importJob.hasHeader && header[colNumber]) {
        mappingKey = header[colNumber];
        colTitle = header[colNumber];
      }
      if (fieldMappingByUser[mappingKey] === undefined) {
        errorMessages.push(`Column ${colTitle} is neither mapped nor ignored.`);
      }
    }
    if (errorMessages.length > 0) {
      this.setState({ errorMessages });
    } else {
      this.props.onChangeActiveScreen("success");
    }
  }

  handleBackButtonClick = () => {
    this.props.onChangeActiveScreen("initial");
  }

  matchFields = (fieldKey, columnName) => {
    const fieldMappingByUser = Object.assign({}, this.state.fieldMappingByUser);
    fieldMappingByUser[columnName] = fieldKey;
    this.setState({ fieldMappingByUser });
  }

  renderFieldMatchingColumns() {
    const { header, importJob, sampleData } = this.props;
    const { fieldOptions, fieldMappingByUser } = this.state;
    return sampleData.map((column, index) => {
      let mappingKey = `${index}`;
      let colTitle = `Column ${index + 1}`;
      if (importJob.hasHeader && header[index]) {
        mappingKey = header[index];
        colTitle = header[index];
      }
      return (
        <FieldMatchingColumn
          key={mappingKey}
          mappingKey={mappingKey}
          colData={column}
          colTitle={colTitle}
          fieldOptions={fieldOptions}
          matchFields={this.matchFields}
          selectedField={fieldMappingByUser[mappingKey] !== "undefined" ? fieldMappingByUser[mappingKey] : "ignore"}
        />
      );
    });
  }

  handleMappingNameFieldChange = (event, value) => {
    this.setState({ newMappingName: value });
  }

  handleUpdateMappingChange = (event, value) => {
    this.setState({ updateMapping: value });
  }

  renderNewOrUpdateMapping() {
    const { importJob } = this.props;
    const { newMappingName, updateMapping } = this.state;
    if (importJob.importMapping === "create") {
      return (
        <Components.TextField
          label="Save this as a new mapping template"
          name="newMappingName"
          onBlur={this.handleMappingNameFieldChange}
          onChange={this.handleMappingNameFieldChange}
          onReturnKeyDown={this.handleMappingNameFieldChange}
          value={newMappingName}
        />
      );
    }
    return (
      <Components.Switch
        name="updateMappingr"
        label="Update this mapping?"
        checked={updateMapping}
        onChange={this.handleUpdateMappingChange}
      />
    );
  }

  renderErrorMessages() {
    const { errorMessages } = this.state;
    if (errorMessages.length > 0) {
      return (
        <div className="alert alert-danger">
          {errorMessages.map((message, index) => (<p key={index}>{message}</p>))}
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <h3>Match the fields.</h3>
            {this.renderFieldMatchingColumns()}
          </div>
          <div className="col-sm-12 col-md-6">
            {this.renderNewOrUpdateMapping()}
            {this.renderErrorMessages()}
            <Button
              className="btn btn-default"
              onClick={this.handleBackButtonClick}
            >
              Back
            </Button>
            <Button
              className="btn btn-primary"
              bezelStyle="solid"
              onClick={this.handleDoneButtonClick}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

MappingScreen.propTypes = {
  header: PropTypes.array,
  importJob: PropTypes.object,
  onChangeActiveScreen: PropTypes.func,
  sampleData: PropTypes.array,
  selectedMapping: PropTypes.object
};

export default MappingScreen;
