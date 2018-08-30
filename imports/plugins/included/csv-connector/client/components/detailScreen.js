import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import { Components } from "@reactioncommerce/reaction-components";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";

class DetailScreen extends Component {
  componentDidMount() {
    const { jobItem: { fileSource, jobType, jobSubType } } = this.props;
    if (jobType === "import" && !jobSubType) {
      this.props.onSetJobItemField("jobSubType", "create");
    }
    if (jobType === "import" && !fileSource) {
      this.props.onSetJobItemField("fileSource", "manual");
    }
  }

  handleChangeDataType = (value) => {
    this.props.onSetJobItemField("collection", value);
  }

  handleChangeFileSource = (value) => {
    this.props.onSetJobItemField("fileSource", value);
  }

  handleChangeJobName = (value) => {
    this.props.onSetJobItemField("name", value);
  }

  handleChangeJobSubType = (value) => {
    this.props.onSetJobItemField("jobSubType", value);
  }

  handleChangeMappingId = (value) => {
    this.props.onSetJobItemField("mappingId", value);
  }

  handleClickBack = () => {
    this.props.onSetActiveScreen("start", false);
  }

  handleClickDone = () => {
    this.props.onDone();
  }

  handleClickNext = () => {
    this.props.onSetActiveScreen("mapping");
  }

  handleFileUpload = (acceptedFiles) => {
    const filesArray = Array.from(acceptedFiles);
    if (filesArray.length === 0) return;
    this.props.onSetJobItemField("fileUpload", filesArray[0]);
  }

  handleSelectChange = (value, field) => {
    this.props.onSetJobItemField(field, value);
  }

  renderDataTypeSelection() {
    const { errors: { collection: dataTypeErrors }, dataTypeOptions, jobItem: { collection } } = this.props;
    return (
      <Field errors={dataTypeErrors} name="collection" label="Data type" labelFor="collectionInput">
        <Select
          id="collectionInput"
          name="collection"
          options={dataTypeOptions}
          value={collection || ""}
          onChange={this.handleChangeDataType}
          errors={dataTypeErrors}
          isSearchable
          isClearable
        />
        <ErrorsBlock errors={dataTypeErrors} />
      </Field>
    );
  }

  renderFileName() {
    const { jobItem: { fileUpload: { name: fileName } } } = this.props;
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
    );
  }

  renderFileUpload() {
    const { errors: { fileUpload: fileUploadErrors }, jobItem: { jobType, fileSource } } = this.props;
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
              <div className="mt10">
                <i className="fa fa-2x fa-upload"/>
              </div>
              <div className="mt10 mb10">
                <Components.Translation defaultValue="Click or drop file here" i18nKey="mediaUploader.dropFiles" />
              </div>
              {this.renderFileName()}
            </div>
          </Dropzone>
          <div className="text-center">
            <ErrorsBlock errors={fileUploadErrors} />
          </div>
        </div>
      );
    }
    return null;
  }

  renderJobName() {
    const { errors: { name: jobNameErrors }, jobItem: { name } } = this.props;
    return (
      <Field errors={jobNameErrors} name="name" label="Job name" labelFor="jobNameInput">
        <TextInput
          errors={jobNameErrors}
          id="jobNameInput"
          name="name"
          value={name || ""}
          onChange={this.handleChangeJobName}
        />
        <ErrorsBlock errors={jobNameErrors} />
      </Field>
    );
  }

  renderJobSubTypeSelection() {
    const { jobItem: { jobSubType } } = this.props;
    const jobSubTypeOptions = [{
      id: "create",
      label: "New job",
      value: "create"
    },
    {
      id: "fromPrevious",
      label: "From previous job",
      value: "fromPrevious"
    }];
    return (
      <SelectableList
        components={{
          SelectableItem: (listProps) => (<SelectableItem item={listProps.item} />)
        }}
        options={jobSubTypeOptions}
        name="jobSubType"
        value={jobSubType || "create"}
        onChange={this.handleChangeJobSubType}
      />
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
      <Field name="mappingId" label="Choose a mapping template" labelFor="mappingIdInput">
        <Select
          id="mappingIdInput"
          name="mappingId"
          options={mappingOptions}
          value={mappingId || "create"}
          onChange={this.handleChangeMappingId}
          isSearchable
        />
      </Field>
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
  errors: PropTypes.object,
  jobItem: PropTypes.object,
  mappingOptions: PropTypes.arrayOf(PropTypes.object),
  onDone: PropTypes.func,
  onSetActiveScreen: PropTypes.func,
  onSetJobItemField: PropTypes.func
};

export default DetailScreen;
