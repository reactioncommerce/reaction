import React, { Component } from "react";
import { compose } from "recompose";
import Papa from "papaparse";
import Alert from "sweetalert2";
import { Components, composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Meteor } from "meteor/meteor";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import Logger from "/client/modules/logger";
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
      fileSource,
      fileUpload,
      jobType,
      mappingId,
      name,
      newMappingName,
      saveMappingAction,
      shouldSaveToNewMapping
    } = this.state;
    const errors = {};
    if (activeScreen === "detail") {
      if (!name) {
        errors.name = [{ name: "name", message: "Job name is required." }];
      } else {
        errors.name = [];
      }
      if (jobType === "import" && fileSource === "manual" && !fileUpload.name) {
        errors.fileUpload = [{ name: "fileUpload", message: "File is required." }];
      } else {
        errors.fileUpload = [];
      }
    } else if (activeScreen === "mapping") {
      if ((mappingId === "create" && shouldSaveToNewMapping) || (mappingId !== "create" && saveMappingAction === "create")) {
        if (!newMappingName) {
          errors.newMappingName = [{ name: "newMappingName", message: "New name is required." }];
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
    const { collection } = this.state;
    let mappingId;
    this.updateField(field, value);
    if (field === "collection" && collection !== value) {
      const mappings = Mappings.find({ collection: value }).fetch();
      const newMappingOptions = mappings.map((mapping) => ({ value: mapping._id, label: mapping.name }));
      newMappingOptions.push({
        value: "create",
        label: "Create new mapping"
      });
      this.setState({ mappingOptions: newMappingOptions });
      mappingId = newMappingOptions[0].value;
      this.updateField("mappingId", mappingId);
    }

    if (field === "mappingId") {
      mappingId = value;
    }

    const currentCollection = field === "collection" ? value : collection;
    if (mappingId && currentCollection) {
      const fieldOptions = getFieldOptionsForCollection(currentCollection);
      this.setState({ fieldOptions });
      if (mappingId === "create") {
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
    let sampleData = {};
    const mappingByUser = {};
    try {
      const rows = await this.getCSVFilePreviewRows();
      sampleData = this.getSampleData(rows);
    } catch (error) {
      Logger.error(error);
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
      fileSource,
      fileUpload,
      hasHeader,
      jobSubType,
      jobType,
      mappingByUser,
      mappingId,
      name,
      newMappingName,
      saveMappingAction,
      shouldSaveToNewMapping,
      shouldExportToS3,
      shouldExportToSFTP
    } = this.state;
    const errors = this.getValidationErrors();

    // If any field has validation error, return right away
    for (const field in errors) {
      if (errors[field].length > 0) {
        return this.setState({ errors });
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
      saveMappingAction,
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
      fileRecord.upload({ endpoint: "/jobs/uploads" })
        .then(() => JobFiles.insert(fileRecord))
        .then(() => {
          Alert(i18next.t("app.success"), i18next.t("admin.alerts.jobItemSaved"), "success");
          return this.setState(this.defaultState);
        }).catch((error) => Alert(i18next.t("app.error"), error.message, "error"));
    } else {
      return this.setState(this.defaultState);
    }
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
      sampleData,
      saveMappingAction,
      selectedMapping,
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
          <h4>CSV Jobs Status</h4>
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
              <h4>Settings</h4>
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
