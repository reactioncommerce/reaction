import update from "immutability-helper";
import Dropzone from "react-dropzone";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import Button from "@reactioncommerce/components/Button/v1";
import { Meteor } from "meteor/meteor";


class InitialScreen extends Component {
  constructor(props) {
    super(props);
    const { importJob, importMappings } = props;
    const importMappingOptions = this.buildImportMappingOptions(importJob, importMappings);
    this.state = {
      errorMessages: [],
      fileName: "",
      importJob,
      importMappingOptions,
      csvFile: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.importJob && !nextProps.importJob.collection) {
      this.setState({ importMappingOptions: [] });
    } else {
      const importMappingOptions = this.buildImportMappingOptions(nextProps.importJob, nextProps.importMappings);
      this.setState({ importMappingOptions });
    }
    this.setState({
      importJob: nextProps.importJob
    });
  }

  buildImportMappingOptions = (importJob, importMappings) => {
    let importMappingOptions = [];
    if (importJob.collection) {
      importMappingOptions = importMappings.map((mapping) => ({ value: mapping._id, label: mapping.name }));
      importMappingOptions.push({
        value: "create",
        label: "Create new mapping"
      });
    }
    return importMappingOptions;
  }

  handleNextButtonClick = () => {
    const { importJob, fileName } = this.state;
    const errorMessages = [];
    if (!importJob.collection) {
      errorMessages.push("Please pick a data type.");
    }
    if (!importJob.importMapping) {
      errorMessages.push("Please pick a mapping template.");
    }
    if (!importJob.name) {
      errorMessages.push("Please provide a reference.");
    }
    if (!fileName) {
      errorMessages.push("Please upload a file.");
    }
    if (errorMessages.length === 0) {
      this.props.onChangeActiveScreen("mapping");
    } else {
      this.setState({ errorMessages });
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

  handleHasHeaderChange = (event, value, field) => {
    this.handleFieldChange(event, value, field);
    this.handleFieldBlur(event, value, field);
  }

  handleSelectChange = (value, field) => {
    const { onImportJobFieldSave } = this.props;
    const { importJob } = this.state;
    const importJobId = importJob._id || "";
    onImportJobFieldSave(importJobId, field, value);
    if (field === "collection") {
      onImportJobFieldSave(importJobId, "importMapping", "create");
    }
  }

  downloadSampleCSVFile = () => {
    const { importJob } = this.state;
    if (importJob && importJob.collection && importJob.importMapping) {
      Meteor.call("importJobs/getSampleCSVFileHeader", importJob.collection, importJob.importMapping, (error, csvHeader) => {
        const blob = new Blob([csvHeader]);
        const fileName = `${importJob.collection}Template.csv`;
        window.navigator.msSaveBlob(blob, fileName);
      });
    }
  }

  saveFileToState = (acceptedFiles) => {
    const filesArray = Array.from(acceptedFiles);
    if (filesArray.length === 0) return;
    const csvFile = filesArray[0];
    this.setState({ fileName: csvFile.name });
    this.props.onFileUpload(csvFile);
  }

  renderDownloadSampleCSVFile() {
    const { importJob } = this.state;
    if (importJob.collection && importJob.importMapping) {
      return (
        <Components.Button
          title="Download a sample CSV File"
          className="btn btn-primary"
          onClick={this.downloadSampleCSVFile}
        >
          Download a sample CSV File
        </Components.Button>
      );
    }
    return null;
  }

  renderCSVFileName() {
    const { fileName } = this.state;
    if (fileName) {
      return (<span>{fileName}</span>);
    }
    return null;
  }

  renderErrorMessages() {
    const { errorMessages } = this.state;
    if (errorMessages.length > 0) {
      return (
        <div className="alert alert-danger">
          {errorMessages.map((message) => (<p>{message}</p>))}
        </div>
      );
    }
    return null;
  }

  render() {
    const { impCollOptions } = this.props;
    const { importJob, importMappingOptions } = this.state;

    return (
      <div>
        <div className="row">
          <div className="col-sm-12 col-md-6 col-md-offset-3">
            <Components.Select
              clearable={false}
              label="Select data type"
              name="collection"
              onChange={this.handleSelectChange}
              options={impCollOptions}
              value={importJob.collection || ""}
            />
            <Components.Select
              clearable={false}
              label="Select a mapping template"
              name="importMapping"
              onChange={this.handleSelectChange}
              options={importMappingOptions}
              value={importJob.importMapping || "create"}
            />
            {this.renderDownloadSampleCSVFile()}
            <Components.TextField
              label="Reference"
              name="name"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              value={importJob.name}
            />
            <Dropzone
              accept="text/csv, application/csv"
              className="rui button btn btn-default btn-block"
              multiple={false}
              onDrop={this.saveFileToState}
            >
              <div className="contents">
                <div>
                  <i className="fa fa-3x fa-upload"/>
                </div>
                <div>
                  <Components.Translation defaultValue="Click or drop file here" i18nKey="mediaUploader.dropFiles" />
                </div>
                {this.renderCSVFileName()}
              </div>
            </Dropzone>
            <Components.Switch
              name="hasHeader"
              label={"First row contains column names?"}
              onLabel={"First row contains column names?"}
              checked={importJob.hasHeader}
              onChange={this.handleHasHeaderChange}
            />
            {this.renderErrorMessages()}
            <Button
              className="btn btn-primary"
              bezelStyle="solid"
              onClick={this.handleNextButtonClick}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

InitialScreen.propTypes = {
  impCollOptions: PropTypes.arrayOf(PropTypes.object),
  importJob: PropTypes.object,
  importMappings: PropTypes.arrayOf(PropTypes.object),
  onChangeActiveScreen: PropTypes.func,
  onFileUpload: PropTypes.func,
  onImportJobFieldSave: PropTypes.func
};

export default InitialScreen;
