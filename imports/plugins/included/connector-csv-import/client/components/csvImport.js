import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import update from "immutability-helper";

class CSVImport extends Component {
  constructor(props) {
    super(props);
    const { importJob, importMappings } = this.props;
    const importMappingOptions = this.buildImportMappingOptions(importJob, importJob.collection, importMappings);
    this.state = {
      hasHeader: importJob && importJob.hasHeader,
      importJob,
      importMappingOptions
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      importJob: nextProps.importJob
    });
  }

  buildImportMappingOptions = (importJob, collection, importMappings) => {
    let importMappingOptions = [];
    if (importJob && collection) {
      if (importMappings) {
        importMappingOptions = importMappings.filter((mapping) => (mapping.collection === collection))
          .map((mapping) => ({ value: mapping._id, label: mapping.reference }));
      }
      importMappingOptions.push({ value: "default", label: "Default" });
    }
    return importMappingOptions;
  }

  handleSelectChange = (value, field) => {
    const { importJob, importMappings, onImportJobFieldSave } = this.props;
    let importJobId = "";
    if (importJob) {
      importJobId = importJob._id;
    }
    if (importJob && field === "collection") {
      const importMappingOptions = this.buildImportMappingOptions(importJob, value, importMappings);
      this.setState({
        importMappingOptions
      });
      let newImportMapping = "";
      if (importMappingOptions) {
        newImportMapping = importMappingOptions[importMappingOptions.length - 1].value;
      }
      onImportJobFieldSave(importJobId, "importMapping", newImportMapping);
    }
    if (onImportJobFieldSave) {
      onImportJobFieldSave(importJobId, field, value);
    }
  }

  handleHasHeaderChange = (event, value, field) => {
    const inverseValue = !value;

    this.setState(({ importJob }) => ({
      hasHeader: value,
      importJob: {
        ...importJob,
        [field]: value
      }
    }));
    this.handleFieldBlur(event, value, field);
  }

  handleFieldChange = (event, value, field) => {
    if (this.state.importJob) {
      const newState = update(this.state, {
        importJob: {
          $merge: {
            [field]: value
          }
        }
      });

      this.setState(newState);
    }
  }

  handleFieldBlur = (event, value, field) => {
    const { onImportJobFieldSave, importJob } = this.props;
    let importJobId = "";
    if (importJob) {
      importJobId = importJob._id;
    }
    if (onImportJobFieldSave) {
      onImportJobFieldSave(importJobId, field, value);
    }
  }

  downloadCSVFile = () => {
    const rows = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach((rowArray) => {
      const row = rowArray.join(",");
      csvContent += `${row}\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  get importJob() {
    return this.state.importJob || this.props.importJob || {};
  }

  render() {
    const { impCollOptions } = this.props;
    return (
      <div className="container">
        <Components.Select
          clearable={false}
          label="What data will you import?"
          name="collection"
          onChange={this.handleSelectChange}
          options={impCollOptions}
          placeholder="Select the data type"
          value={(this.importJob && this.importJob.collection) || ""}
        />
        <Components.TextField
          label="Import Reference"
          name="reference"
          onBlur={this.handleFieldBlur}
          onChange={this.handleFieldChange}
          onReturnKeyDown={this.handleFieldBlur}
          ref="referenceInput"
          value={this.importJob.reference}
        />
        <Components.Select
          clearable={false}
          label="Select a mapping template."
          name="importMapping"
          onChange={this.handleSelectChange}
          options={this.state.importMappingOptions}
          value={(this.importJob && this.importJob.importMapping) || "default"}
        />
        <Components.Button
          title="Download a sample CSV File"
          className="btn btn-primary"
          onClick={this.downloadCSVFile}
          isTextOnly
          isShortHeight
        >
          Download a sample CSV File
        </Components.Button>
        <Components.Switch
          name="hasHeader"
          label={"First row contains column names?"}
          onLabel={"First row contains column names?"}
          checked={!this.state.hasHeader}
          onChange={this.handleHasHeaderChange}
          validation={this.props.validation}
        />
      </div>
    );
  }
}

CSVImport.propTypes = {
  impCollOptions: PropTypes.arrayOf(PropTypes.object),
  importJob: PropTypes.object,
  onImportJobFieldSave: PropTypes.func
};

export default CSVImport;
