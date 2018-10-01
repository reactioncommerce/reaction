import React, { Component } from "react";
import { compose } from "recompose";
import Papa from "papaparse";
import Alert from "sweetalert2";
import { Components, composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Meteor } from "meteor/meteor";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import { i18next } from "/client/api";
import { JobItems, Mappings } from "../../lib/collections";
import { getDataTypeOptions, getDefaultMappingForCollection, getFieldOptionsForCollection } from "../../lib/common/conversionMaps";
import { DetailScreen, JobItemTableColumn, MappingScreen, StartScreen } from "../components";
import { JobFiles } from "../jobFiles";
import S3SettingsContainer from "./s3SettingsContainer";
import SFTPSettingsContainer from "./sftpSettingsContainer";

class CSVConnectorContainer extends Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      activeScreen: "start",
      collection: "",
      dataTypeOptions: getDataTypeOptions(),
      errors: {},
      expanded: true,
      fieldOptions: [],
      fileSource: "",
      fileUpload: {},
      hasHeader: false,
      isSubmitting: false,
      jobSubType: "create",
      jobType: "import",
      mappingId: "",
      mappingOptions: [],
      mappingByUser: {},
      name: "",
      newMappingName: "",
      previousJobId: "",
      saveMappingAction: "none",
      selectedMapping: {},
      shouldExportToS3: false,
      shouldExportToSFTP: false,
      showSettings: false
    };
    this.state = this.defaultState;
  }

  getCSVFilePreviewRows() {
    const { fileUpload, hasHeader } = this.state;
    let previewCount = 3;
    if (hasHeader) {
      previewCount = 4;
    }
    return new Promise((resolve, reject) => {
      Papa.parse(fileUpload, {
        preview: previewCount,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors);
            return;
          }
          resolve(results.data);
        }
      });
    });
  }

  getSampleData(rows) {
    const { hasHeader } = this.state;
    const sampleData = {};
    if (rows.length > 0) {
      let startRow = 0;
      if (hasHeader) {
        startRow = 1;
      }
      for (let i = 0; i < rows[0].length; i += 1) {
        let colName = i;
        if (hasHeader) {
          colName = rows[0][i];
        }
        const data = [];
        for (let j = startRow; j < rows.length; j += 1) {
          data.push(rows[j][i]);
        }
        sampleData[colName] = data;
      }
    }
    return sampleData;
  }

  getValidationErrors() {
    const {
      activeScreen,
      collection,
      fileSource,
      fileUpload,
      jobSubType,
      jobType,
      mappingId,
      name,
      newMappingName,
      previousJobId,
      s3ExportFileKey,
      s3ImportFileKey,
      saveMappingAction,
      sftpExportFilePath,
      sftpImportFilePath,
      shouldExportToS3,
      shouldExportToSFTP,
      shouldSaveToNewMapping
    } = this.state;
    const errors = {};
    if (activeScreen === "detail") {
      if (jobSubType === "create") {
        if (!name) {
          errors.name = [{ name: "name", message: i18next.t("admin.alerts.jobNameRequired") }];
        } else {
          const existingJob = JobItems.findOne({ name, jobType, collection });
          if (existingJob) {
            errors.name = [{ name: "name", message: i18next.t("admin.alerts.jobNameTaken") }];
          }
        }
      } else {
        errors.name = [];
      }
      if (jobType === "import" && fileSource === "manual" && !fileUpload.name) {
        errors.fileUpload = [{ name: "fileUpload", message: i18next.t("admin.alerts.fileRequired") }];
      } else {
        errors.fileUpload = [];
      }
      if (jobSubType === "fromPrevious" && !previousJobId) {
        errors.previousJobId = [{ name: "previousJobId", message: i18next.t("admin.alerts.previousJobRequired") }];
      } else {
        errors.previousJobId = [];
      }
      if (jobType === "import" && fileSource === "s3" && !s3ImportFileKey) {
        errors.s3ImportFileKey = [{ name: "s3ImportFileKey", message: i18next.t("admin.alerts.s3FileKeyRequired") }];
      } else {
        errors.s3ImportFileKey = [];
      }
      if (jobType === "export" && shouldExportToS3 && !s3ExportFileKey) {
        errors.s3ExportFileKey = [{ name: "s3ExportFileKey", message: i18next.t("admin.alerts.s3FileKeyRequired") }];
      } else {
        errors.s3ExportFileKey = [];
      }
      if (jobType === "import" && fileSource === "sftp" && !sftpImportFilePath) {
        errors.sftpImportFilePath = [{ name: "sftpImportFilePath", message: i18next.t("admin.alerts.sftpFilePathRequired") }];
      } else {
        errors.sftpImportFilePath = [];
      }
      if (jobType === "export" && shouldExportToSFTP && !sftpExportFilePath) {
        errors.sftpExportFilePath = [{ name: "sftpExportFilePath", message: i18next.t("admin.alerts.sftpFilePathRequired") }];
      } else {
        errors.sftpExportFilePath = [];
      }
    } else if (activeScreen === "mapping") {
      if ((mappingId === "default" && shouldSaveToNewMapping) || (mappingId !== "default" && saveMappingAction === "create")) {
        if (!newMappingName) {
          errors.newMappingName = [{ name: "newMappingName", message: i18next.t("admin.alerts.mappingNameRequired") }];
        } else {
          errors.newMappingName = [];
        }
      } else {
        errors.newMappingName = [];
      }
    }
    return errors;
  }

  handleCardExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  handleSetActiveScreen = (activeScreen, validate = true) => {
    // When clicking back, there's no need to validate form
    if (validate) {
      const errors = this.getValidationErrors();

      // If any field has validation error, return right away
      for (const field in errors) {
        if (errors[field].length > 0) {
          return this.setState({ errors });
        }
      }
    }

    return this.setState({ activeScreen });
  }

  handleSetField = (field, value) => {
    if (value === this.state[field]) {
      return;
    }
    const { collection, jobType } = this.state;

    if (field === "jobType") {
      this.setState({ ...this.defaultState, jobType: value });
      return;
    }

    if (field === "jobSubType" && value === "fromPrevious") {
      const previousJobs = JobItems.find({ jobType, jobSubType: "create" }).fetch();
      const newPreviousJobsOptions = previousJobs.map((jobItem) => ({ value: jobItem._id, label: jobItem.name }));
      this.setState({
        mappingOptions: [],
        previousJobsOptions: newPreviousJobsOptions
      });
      this.updateField("collection", "");
      this.updateField("fileSource", "");
      this.updateField("mappingId", "");
    }

    this.updateField(field, value);

    let mappingId;
    if (field === "mappingId") {
      mappingId = value;
    }

    let currentCollection = collection;
    if (field === "collection") {
      currentCollection = value;
    }


    if (field === "previousJobId" && value) {
      const prevJob = JobItems.findOne({ _id: value });
      const {
        collection: prevJobCollection,
        fileSource: prevJobFileSource,
        hasHeader: prevJobHasHeader,
        mappingId: prevJobMappingId,
        s3ExportFileKey: prevJobS3ExportFileKey,
        s3ImportFileKey: prevJobS3ImportFileKey,
        sftpExportFilePath: prevJobSFTPExportFilePath,
        sftpImportFilePath: prevJobSFTPImportFilePath,
        shouldExportToS3: prevJobShouldExportToS3,
        shouldExportToSFTP: prevJobShouldExportToSFTP
      } = prevJob;
      mappingId = prevJobMappingId;
      currentCollection = prevJobCollection;
      this.updateField("collection", prevJobCollection);
      this.updateField("fileSource", prevJobFileSource || "");
      this.updateField("hasHeader", prevJobHasHeader);
      this.updateField("s3ExportFileKey", prevJobS3ExportFileKey);
      this.updateField("s3ImportFileKey", prevJobS3ImportFileKey);
      this.updateField("sftpExportFilePath", prevJobSFTPExportFilePath);
      this.updateField("sftpImportFilePath", prevJobSFTPImportFilePath);
      this.updateField("shouldExportToS3", prevJobShouldExportToS3);
      this.updateField("shouldExportToSFTP", prevJobShouldExportToSFTP);
    }

    if (currentCollection && ((field === "collection" && collection !== currentCollection) || field === "previousJobId")) {
      const mappings = Mappings.find({ collection: currentCollection }).fetch();
      const newMappingOptions = mappings.map((mapping) => ({ value: mapping._id, label: mapping.name }));
      let label = "Create new mapping";
      if (jobType === "export") {
        label = "Default mapping";
      }
      newMappingOptions.push({
        value: "default",
        label
      });
      this.setState({ mappingOptions: newMappingOptions });
      if (field === "collection") {
        mappingId = newMappingOptions[0].value;
      }
      this.updateField("mappingId", mappingId);
    }

    if (mappingId && currentCollection) {
      const fieldOptions = getFieldOptionsForCollection(currentCollection);
      this.setState({ fieldOptions });
      if (mappingId === "default") {
        const defaultMapping = getDefaultMappingForCollection(currentCollection);
        this.setState({
          selectedMapping: defaultMapping
        });
      } else {
        const selectedMapping = Mappings.findOne({ _id: mappingId });
        this.setState({
          selectedMapping
        });
      }
    }
  }

  handleSetMappingByUser = (mappingByUser) => {
    this.setState({ mappingByUser });
  }

  handleSetMappingByUserError = (error) => {
    const { errors } = this.state;
    const mappingByUserError = { mappingByUser: error };
    this.setState({
      errors: {
        ...errors,
        ...mappingByUserError
      }
    });
  }

  handleSetSampleData = async () => {
    const { selectedMapping: { mapping } } = this.state;
    let sampleData;
    const mappingByUser = {};
    try {
      const rows = await this.getCSVFilePreviewRows();
      sampleData = this.getSampleData(rows);
    } catch (error) {
      sampleData = {};
    }
    this.setState({ sampleData });

    for (const colName in sampleData) {
      if ({}.hasOwnProperty.call(sampleData, colName)) {
        if (mapping[colName]) {
          mappingByUser[colName] = mapping[colName];
        } else {
          mappingByUser[colName] = "ignore";
        }
      }
    }
    this.setState({ mappingByUser });
  }

  handleSubmitJobItem = async () => {
    const {
      collection,
      errors,
      fileSource,
      fileUpload,
      hasHeader,
      jobSubType,
      jobType,
      mappingByUser,
      mappingId,
      name,
      newMappingName,
      previousJobId,
      saveMappingAction,
      s3ExportFileKey,
      s3ImportFileKey,
      sftpExportFilePath,
      sftpImportFilePath,
      shouldSaveToNewMapping,
      shouldExportToS3,
      shouldExportToSFTP
    } = this.state;

    if (errors.mappingByUser.length > 0) {
      return false;
    }

    const newErrors = this.getValidationErrors();
    // If any field has validation error, return right away
    for (const field in newErrors) {
      if (newErrors[field].length > 0) {
        return this.setState({ errors: newErrors });
      }
    }

    this.setState({ isSubmitting: true });

    const jobItemValues = {
      collection,
      fileSource,
      hasHeader,
      jobSubType,
      jobType,
      mappingByUser,
      mappingId,
      name,
      newMappingName,
      previousJobId,
      saveMappingAction,
      s3ExportFileKey,
      s3ImportFileKey,
      sftpExportFilePath,
      sftpImportFilePath,
      shouldSaveToNewMapping,
      shouldExportToS3,
      shouldExportToSFTP
    };
    let jobItemId;
    try {
      jobItemId = await new Promise((resolve, reject) => {
        Meteor.call("csvConnector/saveJobItem", jobItemValues, (error, newJobItemId) => {
          if (error) {
            return reject(error);
          }
          return resolve(newJobItemId);
        });
      });
    } catch (error) {
      return Alert(i18next.t("app.error"), error.message, "error");
    }

    if (jobType === "import" && fileSource === "manual") {
      const fileRecord = FileRecord.fromFile(fileUpload);
      fileRecord.metadata = { jobItemId, type: "upload" };
      return fileRecord.upload({ endpoint: "/jobs/uploads" })
        .then(() => JobFiles.insert(fileRecord))
        .then(() => {
          Alert(i18next.t("app.success"), i18next.t("admin.alerts.jobItemSaved"), "success");
          return this.setState(this.defaultState);
        }).catch((error) => Alert(i18next.t("app.error"), error.message, "error"));
    }
    return this.setState(this.defaultState);
  }

  renderJobItemScreen() {
    const {
      activeScreen,
      collection,
      errors,
      dataTypeOptions,
      fieldOptions,
      fileSource,
      fileUpload,
      hasHeader,
      jobType,
      jobSubType,
      mappingByUser,
      mappingId,
      mappingName,
      mappingOptions,
      name,
      newMappingName,
      previousJobId,
      previousJobsOptions,
      s3ExportFileKey,
      s3ImportFileKey,
      sampleData,
      saveMappingAction,
      selectedMapping,
      sftpExportFilePath,
      sftpImportFilePath,
      showSettings,
      shouldExportToS3,
      shouldExportToSFTP,
      shouldSaveToNewMapping
    } = this.state;

    if (showSettings) {
      return null;
    }

    if (activeScreen === "start") {
      return (
        <StartScreen
          onSetActiveScreen={this.handleSetActiveScreen}
          onSetField={this.handleSetField}
          jobType={jobType}
        />
      );
    } else if (activeScreen === "detail") {
      return (
        <DetailScreen
          collection={collection}
          dataTypeOptions={dataTypeOptions}
          errors={errors}
          fileSource={fileSource}
          fileUpload={fileUpload}
          hasHeader={hasHeader}
          jobSubType={jobSubType}
          jobType={jobType}
          mappingId={mappingId}
          mappingOptions={mappingOptions}
          name={name}
          onDone={this.handleSubmitJobItem}
          onSetActiveScreen={this.handleSetActiveScreen}
          onSetField={this.handleSetField}
          previousJobId={previousJobId}
          previousJobsOptions={previousJobsOptions}
          s3ExportFileKey={s3ExportFileKey}
          s3ImportFileKey={s3ImportFileKey}
          sftpExportFilePath={sftpExportFilePath}
          sftpImportFilePath={sftpImportFilePath}
          shouldExportToS3={shouldExportToS3}
          shouldExportToSFTP={shouldExportToSFTP}
        />
      );
    }

    return (
      <MappingScreen
        errors={errors}
        fieldOptions={fieldOptions}
        fileUpload={fileUpload}
        hasHeader={hasHeader}
        mappingByUser={mappingByUser}
        mappingId={mappingId}
        mappingName={mappingName}
        newMappingName={newMappingName}
        onDone={this.handleSubmitJobItem}
        onSetActiveScreen={this.handleSetActiveScreen}
        onSetField={this.handleSetField}
        onSetMappingByUser={this.handleSetMappingByUser}
        onSetMappingByUserError={this.handleSetMappingByUserError}
        onSetSampleData={this.handleSetSampleData}
        sampleData={sampleData}
        saveMappingAction={saveMappingAction}
        selectedMapping={selectedMapping}
        shouldSaveToNewMapping={shouldSaveToNewMapping}
      />
    );
  }

  renderJobsList() {
    const { activeScreen, showSettings } = this.state;
    const customRowMetaData = {
      bodyCssClassName: () => "job-item-grid-row"
    };
    const filteredFields = ["name", "jobType", "collection", "uploadedAt", "status"];
    const columns = ["name", "jobType", "collection", "uploadedAt", "status", "completedAt", "delete"];
    const customColumnMetadata = [];

    columns.forEach((field) => {
      let style;
      let width;
      let Header;

      if (field !== "name") {
        style = { textAlign: "center" };
      }

      if (field !== "delete") {
        Header = i18next.t(`admin.dashboard.header.${field}`);
      } else {
        width = 40;
      }

      const columnMeta = {
        accessor: field,
        Header,
        Cell: (row) => (
          <JobItemTableColumn row={row} />
        ),
        style,
        width
      };
      customColumnMetadata.push(columnMeta);
    });

    if (!showSettings && activeScreen === "start") {
      return (
        <div className="mt100">
          <h4>{i18next.t("admin.dashboard.csvJobsStatus")}</h4>
          <SortableTable
            publication="JobItems"
            collection={JobItems}
            columns={columns}
            matchingResultsCount="job-items-count"
            showFilter={true}
            filteredFields={filteredFields}
            rowMetadata={customRowMetaData}
            columnMetadata={customColumnMetadata}
            externalLoadingComponent={Components.Loading}
          />
        </div>
      );
    }
    return null;
  }

  renderSettings() {
    const { showSettings } = this.state;
    if (showSettings) {
      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <h4>{i18next.t("admin.dashboard.settings")}</h4>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12 col-md-5">
              <SFTPSettingsContainer />
            </div>
            <div className="col-sm-12 col-md-offset-1 col-md-5">
              <S3SettingsContainer />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  renderSettingsButton() {
    const { activeScreen, showSettings } = this.state;
    if (showSettings || activeScreen === "start") {
      return (
        <div className="pull-right">
          <Components.IconButton
            icon="fa fa-gear"
            onClick={this.toggleSettings}
          />
        </div>
      );
    }
    return null;
  }

  toggleSettings = () => {
    this.setState({ showSettings: !this.state.showSettings });
  }

  updateField = (field, value) => {
    const { errors } = this.state;

    this.setState({ [field]: value }, () => {
      if (errors[field]) { // means that the field already had validation error before
        const newErrors = this.getValidationErrors();
        this.setState({ errors: newErrors });
      }
    });
  }

  render() {
    const { expanded } = this.state;
    return (
      <Components.CardGroup>
        <Components.Card expanded={expanded} onExpand={this.handleCardExpand}>
          <Components.CardHeader
            i18nKeyTitle="dashboard.csvImportExport"
            title="CSV Import/Export"
            onChange={this.handleFieldChange}
            actAsExpander
          />
          <Components.CardBody expandable>
            <div className="csv-connector">
              {this.renderSettingsButton()}
              {this.renderJobItemScreen()}
              {this.renderJobsList()}
              {this.renderSettings()}
            </div>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

/**
 * @name composer
 * @summary Subscribes the container to Mappings
 * @param {Object} props - Props passed down from parent components
 * @param {Function} onData - Callback to execute with props
 * @returns {Function} callback to append props
 */
function composer(props, onData) {
  Meteor.subscribe("JobItems").ready();
  Meteor.subscribe("Mappings").ready();
  return onData(null, { ...props });
}

registerComponent("CSVConnector", CSVConnectorContainer, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(CSVConnectorContainer);
