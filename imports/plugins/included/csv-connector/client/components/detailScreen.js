import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import { Components } from "@reactioncommerce/reaction-components";
import Button from "@reactioncommerce/components/Button/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";

class DetailScreen extends Component {
  handleChangeFileSource = (value) => {
    this.props.onSetJobItemField("fileSource", value);
  }

  handleChangeJobSubType = (value) => {
    this.props.onSetJobItemField("jobSubType", value);
  }

  handleClickBack = () => {
    this.props.onSetActiveScreen("start");
  }

  handleClickDone = () => {
    this.props.onDone();
  }

  handleClickNext = () => {
    this.props.onSetActiveScreen("mapping");
  }

  handleFieldChange = (event, value, field) => {
    this.props.onSetJobItemField(field, value);
  }

  handleFileUpload = (acceptedFiles) => {
    this.props.onFileUpload(acceptedFiles);
  }

  handleSelectChange = (value, field) => {
    this.props.onSetJobItemField(field, value);
  }

  renderDataTypeSelection() {
    const { dataTypeOptions, jobItem: { collection } } = this.props;
    return (
      <Components.Select
        clearable
        label="Data type"
        name="collection"
        onChange={this.handleSelectChange}
        options={dataTypeOptions}
        value={collection || ""}
      />
    );
  }

  renderFileName() {
    const { fileName } = this.props;
    if (fileName) {
      if (fileName.length < 30) {
        return (<span>{fileName}</span>);
      }
      const subFileName = `...${fileName.substring(fileName.length - 27, fileName.length)}`;
      return (<span>{subFileName}</span>);
    }
    return null;
  }

  renderFileSourceSelection() {
    const { jobItem: { fileSource } } = this.props;
    const fileSourceOptions = [{
      id: "manual",
      label: "Manual",
      value: "manual"
    },
    {
      id: "sftp",
      label: "SFTP Server",
      value: "sftp"
    },
    {
      id: "s3",
      label: "AWS S3 Bucket",
      value: "s3"
    }];
    return (
      <div className="mt20">
        <p>Choose file source:</p>
        <div className="selectable-list">
          <SelectableList
            components={{
              SelectableItem: (listProps) => (<SelectableItem item={listProps.item} />)
            }}
            options={fileSourceOptions}
            name="fileSource"
            value={fileSource || "manual"}
            onChange={this.handleChangeFileSource}
          />
        </div>
      </div>
    );
  }

  renderFileUpload() {
    const { jobItem: { jobType, fileSource } } = this.props;
    if (jobType === "import" && fileSource === "manual") {
      return (
        <div className="mt20 ml20 mr20">
          <Dropzone
            accept="text/csv, application/csv"
            className="rui button btn btn-default btn-block"
            style={{ fontWeight: 400 }}
            multiple={false}
            onDrop={this.handleFileUpload}
          >
            <div className="contents">
              <div>
                <i className="fa fa-2x fa-upload"/>
              </div>
              <div className="mt10 mb10">
                <Components.Translation defaultValue="Click or drop file here" i18nKey="mediaUploader.dropFiles" />
              </div>
              {this.renderFileName()}
            </div>
          </Dropzone>
        </div>
      );
    }
    return null;
  }

  renderJobName() {
    const { jobItem: { name } } = this.props;
    return (
      <Components.TextField
        i18nKeyLabel="admin.dashboard.jobName"
        label="Job name"
        name="name"
        onChange={this.handleFieldChange}
        ref="nameInput"
        value={name || ""}
      />
    );
  }

  renderJobSubTypeSelection() {
    const { jobItem: { jobSubType } } = this.props;
    const jobSubTypeOptions = [{
      id: "new",
      label: "New job",
      value: "new"
    },
    {
      id: "fromPrevious",
      label: "From previous job",
      value: "fromPrevious"
    }];
    return (
      <div className="selectable-list">
        <SelectableList
          components={{
            SelectableItem: (listProps) => (<SelectableItem item={listProps.item} />)
          }}
          options={jobSubTypeOptions}
          name="jobSubType"
          value={jobSubType || "new"}
          onChange={this.handleChangeJobSubType}
        />
      </div>
    );
  }

  renderJobTypeText() {
    const { jobItem: { jobType } } = this.props;
    if (jobType === "import") {
      return <h4>Import</h4>;
    }
    return <h4>Export</h4>;
  }

  renderMappingSelection() {
    const { mappingOptions, jobItem: { mappingId } } = this.props;
    return (
      <Components.Select
        clearable={false}
        label="Choose a mapping template"
        name="mappingId"
        onChange={this.handleSelectChange}
        options={mappingOptions}
        value={mappingId || "create"}
      />
    );
  }

  renderNextOrDoneButton() {
    const { jobItem: { fileSource, jobType } } = this.props;
    if (jobType === "import" && fileSource === "manual") {
      return <Button onClick={this.handleClickNext}>Next</Button>;
    }
    return <Button onClick={this.handleClickDone}>Done</Button>;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            {this.renderJobTypeText()}
            {this.renderJobSubTypeSelection()}
            {this.renderFileSourceSelection()}
            {this.renderFileUpload()}
          </div>
          <div className="col-sm-12 col-md-6">
            {this.renderDataTypeSelection()}
            {this.renderMappingSelection()}
            {this.renderJobName()}
          </div>
        </div>
        <div className="row pull-right mt20 mb20">
          <Button actionType="secondary" onClick={this.handleClickBack} className="mr20">Back</Button>
          {this.renderNextOrDoneButton()}
        </div>
      </div>
    );
  }
}

DetailScreen.propTypes = {
  dataTypeOptions: PropTypes.arrayOf(PropTypes.object),
  fileName: PropTypes.string,
  jobItem: PropTypes.object,
  mappingOptions: PropTypes.arrayOf(PropTypes.object),
  onDone: PropTypes.func,
  onFileUpload: PropTypes.func,
  onSetActiveScreen: PropTypes.func,
  onSetJobItemField: PropTypes.func
};

export default DetailScreen;
