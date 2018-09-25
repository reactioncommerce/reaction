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
    // when import from previous job is clicked, false is passed as value instead of ""
    this.props.onSetField("fileSource", value || "");
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

  handleChangePreviousJobId = (value) => {
    this.props.onSetField("previousJobId", value);
  }

  handleChangeS3ExportFileKey = (value) => {
    this.props.onSetField("s3ExportFileKey", value);
  }

  handleChangeS3ImportFileKey = (value) => {
    this.props.onSetField("s3ImportFileKey", value);
  }

  handleChangeSFTPExportFilePath = (value) => {
    this.props.onSetField("sftpExportFilePath", value);
  }

  handleChangeSFTPImportFilePath = (value) => {
    this.props.onSetField("sftpImportFilePath", value);
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
    const { collection, dataTypeOptions, jobSubType } = this.props;
    return (
      <Field name="collection" label="Choose the data type" labelFor="collectionInput">
        <Select
          id="collectionInput"
          name="collection"
          options={dataTypeOptions}
          value={collection || ""}
          onChange={this.handleChangeDataType}
          isReadOnly={jobSubType === "fromPrevious"}
          isSearchable
        />
      </Field>
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
    const { fileSource, jobSubType, jobType, shouldExportToSFTP, shouldExportToS3 } = this.props;
    let isReadOnly = false;
    let defaultValue = "manual";
    if (jobSubType === "fromPrevious") {
      isReadOnly = true;
      defaultValue = "";
    }
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
              SelectableItem: (listProps) => (<SelectableItem item={listProps.item} isReadOnly={listProps.isReadOnly} />)
            }}
            options={fileSourceOptions}
            name="fileSource"
            value={fileSource || defaultValue}
            onChange={this.handleChangeFileSource}
            isReadOnly={isReadOnly}
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
          isReadOnly={isReadOnly}
        />
        {this.renderSFTPExportFilePath()}
        <Checkbox
          label="S3"
          name="shouldExportToS3"
          onChange={this.handleChangeShouldExportToS3}
          value={shouldExportToS3}
          isReadOnly={isReadOnly}
        />
        {this.renderS3ExportFilePath()}
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
    const { hasHeader, jobSubType, jobType } = this.props;
    if (jobType === "import") {
      return (
        <div className="mt20">
          <Checkbox
            label="First row contains column names?"
            name="hasHeader"
            onChange={this.handleChangeHasHeader}
            value={hasHeader}
            isReadOnly={jobSubType === "fromPrevious"}
          />
        </div>
      );
    }
    return null;
  }

  renderJobName() {
    const { errors: { name: jobNameErrors }, jobSubType, name } = this.props;
    if (jobSubType === "fromPrevious") {
      return null;
    }
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
    const { jobSubType, mappingOptions, mappingId } = this.props;
    return (
      <Field name="mappingId" label="Choose a mapping template" labelFor="mappingIdInput">
        <Select
          id="mappingIdInput"
          name="mappingId"
          options={mappingOptions}
          value={mappingId || "default"}
          onChange={this.handleChangeMappingId}
          isReadOnly={jobSubType === "fromPrevious"}
          isSearchable
        />
      </Field>
    );
  }

  renderNextOrDoneButton() {
    const { fileSource, jobSubType, jobType } = this.props;
    if (jobType === "import" && jobSubType === "create" && fileSource === "manual") {
      return <Button onClick={this.handleClickNext}>Next</Button>;
    }
    return <Button onClick={this.handleClickDone}>Done</Button>;
  }

  renderPreviousJobsSelection() {
    const { errors: { previousJobId: previousJobIdErrors }, jobSubType, previousJobId, previousJobsOptions } = this.props;
    if (jobSubType === "fromPrevious") {
      return (
        <Field errors={previousJobIdErrors} name="previousJobId" label="Select previous job" labelFor="previousJobIdInput">
          <Select
            id="previousJobIdInput"
            name="previousJobId"
            options={previousJobsOptions}
            value={previousJobId}
            onChange={this.handleChangePreviousJobId}
            isSearchable
          />
          <ErrorsBlock errors={previousJobIdErrors} />
        </Field>
      );
    }
    return null;
  }

  renderS3ExportFilePath() {
    const { errors: { s3ExportFileKey: s3ExportFileKeyErrors }, jobType, s3ExportFileKey, shouldExportToS3 } = this.props;
    if (jobType !== "export" || !shouldExportToS3) {
      return null;
    }
    return (
      <Field errors={s3ExportFileKeyErrors} name="s3ExportFileKey" label="S3 file key" labelFor="s3ExportFileKeyInput">
        <TextInput
          errors={s3ExportFileKeyErrors}
          id="s3ExportFileKeyInput"
          name="s3ExportFileKey"
          value={s3ExportFileKey}
          placeholder="exports/export.csv"
          onChanging={this.handleChangeS3ExportFileKey}
        />
        <ErrorsBlock errors={s3ExportFileKeyErrors} />
      </Field>
    );
  }

  renderS3ImportFileKey() {
    const { errors: { s3ImportFileKey: s3ImportFileKeyErrors }, fileSource, jobType, s3ImportFileKey } = this.props;
    if (jobType !== "import" || fileSource !== "s3") {
      return null;
    }
    return (
      <Field errors={s3ImportFileKeyErrors} name="s3ImportFileKey" label="S3 file key" labelFor="s3ImportFileKeyInput">
        <TextInput
          errors={s3ImportFileKeyErrors}
          id="s3ImportFileKeyInput"
          name="s3ImportFileKey"
          value={s3ImportFileKey}
          placeholder="imports/import.csv"
          onChanging={this.handleChangeS3ImportFileKey}
        />
        <ErrorsBlock errors={s3ImportFileKeyErrors} />
      </Field>
    );
  }

  renderSFTPExportFilePath() {
    const { errors: { sftpExportFilePath: sftpExportFilePathErrors }, jobType, sftpExportFilePath, shouldExportToSFTP } = this.props;
    if (jobType !== "export" || !shouldExportToSFTP) {
      return null;
    }
    return (
      <Field errors={sftpExportFilePathErrors} name="sftpExportFilePath" label="SFTP file path" labelFor="sftpExportFilePathInput">
        <TextInput
          errors={sftpExportFilePathErrors}
          id="sftpExportFilePathInput"
          name="sftpExportFilePath"
          value={sftpExportFilePath}
          placeholder="exports/export.csv"
          onChanging={this.handleChangeSFTPExportFilePath}
        />
        <ErrorsBlock errors={sftpExportFilePathErrors} />
      </Field>
    );
  }

  renderSFTPImportFilePath() {
    const { errors: { sftpImportFilePath: sftpImportFilePathErrors }, fileSource, jobType, sftpImportFilePath } = this.props;
    if (jobType !== "import" || fileSource !== "sftp") {
      return null;
    }
    return (
      <Field errors={sftpImportFilePathErrors} name="sftpImportFilePath" label="SFTP file path" labelFor="sftpImportFilePathInput">
        <TextInput
          errors={sftpImportFilePathErrors}
          id="sftpImportFilePathInput"
          name="sftpImportFilePath"
          value={sftpImportFilePath}
          placeholder="imports/import.csv"
          onChanging={this.handleChangeSFTPImportFilePath}
        />
        <ErrorsBlock errors={sftpImportFilePathErrors} />
      </Field>
    );
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
          <div className="col-sm-12 col-md-5">
            {this.renderJobSubTypeSelection()}
            {this.renderPreviousJobsSelection()}
            {this.renderFileSourceSelection()}
            {this.renderS3ImportFileKey()}
            {this.renderSFTPImportFilePath()}
            {this.renderFileUpload()}
            {this.renderHasHeader()}
          </div>
          <div className="col-sm-12 col-md-5 col-md-offset-1">
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
  onSetMappingByUser: PropTypes.func,
  previousJobId: PropTypes.string,
  previousJobsOptions: PropTypes.arrayOf(PropTypes.object),
  s3ExportFileKey: PropTypes.string,
  s3ImportFileKey: PropTypes.string,
  selectedMapping: PropTypes.object,
  sftpExportFilePath: PropTypes.string,
  sftpImportFilePath: PropTypes.string,
  shouldExportToS3: PropTypes.bool,
  shouldExportToSFTP: PropTypes.bool
};

export default DetailScreen;
