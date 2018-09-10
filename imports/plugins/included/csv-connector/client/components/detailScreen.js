import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import { Components } from "@reactioncommerce/reaction-components";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";

class DetailScreen extends Component {
  componentDidMount() {
    const {
      collection,
      dataTypeOptions,
      onSetField
    } = this.props;
    if (!collection && dataTypeOptions.length > 0) {
      onSetField("collection", dataTypeOptions[0].value);
    }
  }

  handleChangeDataType = (value) => {
    this.props.onSetField("collection", value);
  }

  handleChangeFileSource = (value) => {
    this.props.onSetField("fileSource", value);
  }

  handleChangeHasHeader = (value) => {
    this.props.onSetField("hasHeader", value);
  }

  handleChangeJobName = (value) => {
    this.props.onSetField("name", value);
  }

  handleChangeJobSubType = (value) => {
    this.props.onSetField("jobSubType", value);
  }

  handleChangeMappingId = (value) => {
    this.props.onSetField("mappingId", value);
  }

  handleChangeShouldExportToS3 = (value) => {
    this.props.onSetField("shouldExportToS3", value);
  }

  handleChangeShouldExportToSFTP = (value) => {
    this.props.onSetField("shouldExportToSFTP", value);
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
    this.props.onSetField("fileUpload", filesArray[0]);
  }

  renderDataTypeSelection() {
    const { collection, dataTypeOptions } = this.props;
    return (
      <Select
        id="collectionInput"
        name="collection"
        options={dataTypeOptions}
        value={collection || ""}
        onChange={this.handleChangeDataType}
        isSearchable
      />
    );
  }

  renderFileName() {
    const { fileUpload: { name: fileName } } = this.props;
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
    const { fileSource, jobType, shouldExportToSFTP, shouldExportToS3 } = this.props;
    if (jobType === "import") {
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
    return (
      <div className="mt20">
        <p>Export to:</p>
        <Checkbox
          label="SFTP"
          name="shouldExportToSFTP"
          onChange={this.handleChangeShouldExportToSFTP}
          value={shouldExportToSFTP}
        />
        <Checkbox
          label="S3"
          name="shouldExportToS3"
          onChange={this.handleChangeShouldExportToS3}
          value={shouldExportToS3}
        />
      </div>
    );
  }

  renderFileUpload() {
    const { errors: { fileUpload: fileUploadErrors }, jobType, fileSource } = this.props;
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

  renderHasHeader() {
    const { hasHeader, jobType } = this.props;
    if (jobType === "import") {
      return (
        <div className="mt20">
          <Checkbox
            label="First row contains column names?"
            name="hasHeader"
            onChange={this.handleChangeHasHeader}
            value={hasHeader}
          />
        </div>
      );
    }
    return null;
  }

  renderJobName() {
    const { errors: { name: jobNameErrors }, name } = this.props;
    return (
      <Field errors={jobNameErrors} name="name" label="Job name" labelFor="jobNameInput">
        <TextInput
          errors={jobNameErrors}
          id="jobNameInput"
          name="name"
          value={name || ""}
          onChanging={this.handleChangeJobName}
        />
        <ErrorsBlock errors={jobNameErrors} />
      </Field>
    );
  }

  renderJobSubTypeSelection() {
    const { jobSubType } = this.props;
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
    const { jobType } = this.props;
    if (jobType === "import") {
      return <h4>Import</h4>;
    }
    return <h4>Export</h4>;
  }

  renderMappingSelection() {
    const { mappingOptions, mappingId } = this.props;
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
    const { fileSource, jobType } = this.props;
    if (jobType === "import" && fileSource === "manual") {
      return <Button onClick={this.handleClickNext}>Next</Button>;
    }
    return <Button onClick={this.handleClickDone}>Done</Button>;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            {this.renderJobTypeText()}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            {this.renderJobSubTypeSelection()}
            {this.renderFileSourceSelection()}
            {this.renderFileUpload()}
            {this.renderHasHeader()}
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
  collection: PropTypes.string,
  dataTypeOptions: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.object,
  fileSource: PropTypes.string,
  fileUpload: PropTypes.object,
  hasHeader: PropTypes.bool,
  jobSubType: PropTypes.string,
  jobType: PropTypes.string,
  mappingId: PropTypes.string,
  mappingOptions: PropTypes.arrayOf(PropTypes.object),
  name: PropTypes.string,
  onDone: PropTypes.func,
  onSetActiveScreen: PropTypes.func,
  onSetField: PropTypes.func,
  shouldExportToS3: PropTypes.bool,
  shouldExportToSFTP: PropTypes.bool
};

export default DetailScreen;
