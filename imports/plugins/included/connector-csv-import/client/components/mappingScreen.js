import React, { Component } from "react";
import PropTypes from "prop-types";
import { getFieldOptionsForCollection } from "@reactioncommerce/reaction-import-connectors";
import { Components } from "@reactioncommerce/reaction-components";
import { FileRecord } from "@reactioncommerce/file-collections";
import Button from "@reactioncommerce/components/Button/v1";
import { Meteor } from "meteor/meteor";
import { Logger } from "/client/api";
import FieldMatchingColumn from "./fieldMatchingColumn";
import { ImportFiles } from "/imports/plugins/core/connectors-new/client";


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
      isSubmitting: false,
      newMappingName: "",
      updateMapping: false
    };
  }

  validateMapping = () => {
    // TODO: Validate that a field is mapped to only one CSV column
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
    return errorMessages;
  }

  finalizeMapping = () => {
    const mapping = {};
    const { header, importJob, sampleData } = this.props;
    const { fieldMappingByUser } = this.state;
    for (let colNumber = 0; colNumber < sampleData.length; colNumber += 1) {
      if (importJob.hasHeader) {
        mapping[header[colNumber]] = fieldMappingByUser[header[colNumber]];
      } else {
        mapping[`${colNumber}`] = fieldMappingByUser[`${colNumber}`];
      }
    }
    return mapping;
  }

  handleDoneButtonClick = () => {
    this.setState({ isSubmitting: true });
    const errorMessages = this.validateMapping();
    if (errorMessages.length > 0) {
      this.setState({ errorMessages });
      this.setState({ isSubmitting: false });
      return;
    }

    const { newMappingName, updateMapping } = this.state;
    const { csvFile, importJob } = this.props;

    const finalMapping = this.finalizeMapping();
    if (importJob.importMapping === "create") {
      Meteor.call("importJobs/createMapping", importJob._id, newMappingName, finalMapping);
    } else {
      Meteor.call("importJobs/updateMapping", importJob._id, updateMapping, finalMapping);
    }
    const fileRecord = FileRecord.fromFile(csvFile);
    fileRecord.metadata = { importJobId: importJob._id, type: "upload" };
    const promise = fileRecord.upload({ endpoint: "/imports/uploads" })
      .then(() => ImportFiles.insert(fileRecord))
      .catch((error) => {
        throw error;
      });
    promise.then(() => {
      Meteor.call("importJobs/setStatusToPending", importJob._id);
      this.setState({ isSubmitting: false });
      this.props.onChangeActiveScreen("success");
      return;
    }).catch((err) => {
      Logger.error(err);
    });
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
    const { isSubmitting } = this.state;
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
              isWaiting={isSubmitting}
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
  csvFile: PropTypes.object,
  header: PropTypes.array,
  importJob: PropTypes.object,
  onChangeActiveScreen: PropTypes.func,
  sampleData: PropTypes.array,
  selectedMapping: PropTypes.object
};

export default MappingScreen;
