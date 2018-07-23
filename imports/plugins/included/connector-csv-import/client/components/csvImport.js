import update from "immutability-helper";
import React, { Component } from "react";
import Dropzone from "react-dropzone";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
// import { FileRecord } from "@reactioncommerce/file-collections";
import { Meteor } from "meteor/meteor";
import { getFieldMatchingRelevantData } from "@reactioncommerce/reaction-import-connectors";
import FieldMatching from "./fieldMatching";
// import { Logger } from "/client/api";
// import { ImportFiles } from "/imports/plugins/core/connectors-new/client";

class CSVImport extends Component {
  constructor(props) {
    super(props);
    const { importJob, importMappings } = this.props;
    const importMappingOptions = this.buildImportMappingOptions(
      (importJob && importJob.collection) || "",
      importMappings
    );
    // const isUploading = importJob && importJob.collection;
    this.state = {
      hasHeader: importJob && importJob.hasHeader,
      importJob,
      importMappingOptions,
      isUploading: false,
      header: [],
      sampleData: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.importJob && !nextProps.importJob) {
      this.setState({ importMappingOptions: [] });
    }
    this.setState({
      hasHeader: nextProps.importJob && nextProps.importJob.hasHeader,
      importJob: nextProps.importJob
    });
  }

  buildImportMappingOptions = (collection, importMappings) => {
    let importMappingOptions = [];
    if (collection) {
      if (importMappings) {
        importMappingOptions = importMappings.filter((mapping) => (mapping.collection === collection))
          .map((mapping) => ({ value: mapping._id, label: mapping.reference }));
      }
      importMappingOptions.push({ value: "default", label: "Default" });
    }
    return importMappingOptions;
  }

  handleSelectChange = (value, field) => {
    const { importMappings, onImportJobFieldSave } = this.props;
    const { importJob } = this.state;
    let importJobId = "";
    if (importJob) {
      importJobId = importJob._id;
    }
    if (field === "collection") {
      const importMappingOptions = this.buildImportMappingOptions(value, importMappings);
      this.setState({
        importMappingOptions
      });
      let newImportMapping = "";
      if (importMappingOptions) {
        newImportMapping = importMappingOptions[importMappingOptions.length - 1].value;
      }
      if (importJobId) {
        onImportJobFieldSave(importJobId, "importMapping", newImportMapping);
      }
    }
    if (onImportJobFieldSave) {
      onImportJobFieldSave(importJobId, field, value);
    }
  }

  renderDownloadSampleCSVFile() {
    if (this.state.importJob && this.state.importJob.collection && this.state.importJob.importMapping) {
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

  handleHasHeaderChange = (event, value, field) => {
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

  downloadSampleCSVFile = () => {
    const { importJob } = this.state;
    if (importJob && importJob.collection && importJob.importMapping) {
      Meteor.call("importJobs/getSampleCSVFileHeader", importJob.collection, importJob.importMapping, (error, csvHeader) => {
        const blob = new Blob([csvHeader]);
        const fileName = `${importJob.collection}Template.csv`;
        if (window.navigator.msSaveOrOpenBlob) { // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
          window.navigator.msSaveBlob(blob, fileName);
        } else {
          const a = window.document.createElement("a");
          a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
          a.download = fileName;
          document.body.appendChild(a);
          a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
          document.body.removeChild(a);
        }
      });
    }
  }

  get importJob() {
    return this.state.importJob || this.props.importJob || {};
  }

  saveFileToState = (acceptedFiles) => {
    const filesArray = Array.from(acceptedFiles);
    if (filesArray.length === 0) return;
    const csvFile = filesArray[0];
    this.setState({ csvFile });
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(csvFile);
      reader.onload = () => {
        if (reader.result) {
          resolve(getFieldMatchingRelevantData(reader.result));
        } else {
          reject(Error("Failed reading CSV to text."));
        }
      };
    });
    promise.then((result) => {
      this.setState({
        header: result.header,
        sampleData: result.sampleData
      });
      return;
    }).catch((err) => {
      throw err;
    });
  }

  renderCSVFileName() {
    if (this.state.csvFile) {
      return (<span>{this.state.csvFile.name}</span>);
    }
    return null;
  }

  renderFieldMatching() {
    const { header, sampleData } = this.state;
    if (sampleData.length > 0) {
      console.log("RENDERRING SAMPLE DATAA", sampleData);
      return (
        <FieldMatching
          header={header}
          sampleData={sampleData}
        />
      );
    }
    return null;
  }

  render() {
    const { impCollOptions } = this.props;
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.Select
              clearable={false}
              label="What data will you import?"
              name="collection"
              onChange={this.handleSelectChange}
              options={impCollOptions}
              placeholder="Select the data type"
              value={(this.importJob && this.importJob.collection) || ""}
            />
            <Components.Select
              clearable={false}
              label="Select a mapping template."
              name="importMapping"
              onChange={this.handleSelectChange}
              options={this.state.importMappingOptions}
              value={(this.importJob && this.importJob.importMapping) || "default"}
            />
            {this.renderDownloadSampleCSVFile()}
          </div>
          <div className="col-sm-12 col-md-6">
            <Components.TextField
              label="Import Reference"
              name="reference"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              ref="referenceInput"
              value={this.importJob.reference}
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
              checked={this.state.hasHeader}
              onChange={this.handleHasHeaderChange}
            />
          </div>
        </div>
        <div className="row">
          <Components.Button
            className="btn btn-primary"
            bezelStyle="solid"
            label="Next"
          />
        </div>
        {this.renderFieldMatching()}
      </div>
    );
  }
}

CSVImport.propTypes = {
  impCollOptions: PropTypes.arrayOf(PropTypes.object),
  importJob: PropTypes.object,
  isUploading: PropTypes.bool,
  onImportJobFieldSave: PropTypes.func
};

export default CSVImport;
