import React, { Component } from "react";
import { compose } from "recompose";
import Papa from "papaparse";
import { Components, composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Mappings } from "../../lib/collections";
import { getDataTypeOptions, getDefaultMappingForCollection, getFieldOptionsForCollection } from "../../lib/common/conversionMaps";
import { DetailScreen, MappingScreen, StartScreen } from "../components";
import S3SettingsContainer from "./s3SettingsContainer";
import SFTPSettingsContainer from "./sftpSettingsContainer";

class CSVConnectorContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeScreen: "start",
      collection: "",
      dataTypeOptions: getDataTypeOptions(),
      errors: {},
      expanded: true,
      fieldOptions: [],
      fileSource: "",
      fileUpload: {},
      hasHeader: false,
      jobSubType: "create",
      jobType: "import",
      mappingId: "",
      mappingOptions: [],
      mappingByUser: {},
      name: "",
      selectedMapping: {},
      showSettings: false
    };
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
    const { activeScreen, fileUpload, name } = this.state;
    const errors = {};
    if (activeScreen === "detail") {
      if (!name) {
        errors.name = [{ name: "name", message: "Job name is required." }];
      } else {
        errors.name = [];
      }
      if (!fileUpload.name) {
        errors.fileUpload = [{ name: "fileUpload", message: "File is required." }];
      } else {
        errors.fileUpload = [];
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
          selectedMapping: defaultMapping,
          mappingByUser: defaultMapping.mapping
        });
      } else {
        const selectedMapping = Mappings.findOne({ _id: mappingId });
        this.setState({
          selectedMapping,
          mappingByUser: selectedMapping.mapping
        });
      }
    }
  }

  handleSetMappingByUser = (mappingByUser) => {
    this.setState({ mappingByUser });
  }

  handleSetSampleData = async () => {
    const rows = await this.getCSVFilePreviewRows();
    try {
      const sampleData = this.getSampleData(rows);
      this.setState({ sampleData });
    } catch (error) {
      this.setState({ sampleData: {} });
    }
  }

  handleSubmitJobItem = () => {
    return;
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
      sampleData,
      saveMappingAction,
      selectedMapping,
      showSettings,
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
        onDone={this.handleSubmitJobItem}
        onSetActiveScreen={this.handleSetActiveScreen}
        onSetField={this.handleSetField}
        onSetMappingByUser={this.handleSetMappingByUser}
        onSetSampleData={this.handleSetSampleData}
        sampleData={sampleData}
        saveMappingAction={saveMappingAction}
        selectedMapping={selectedMapping}
        shouldSaveToNewMapping={shouldSaveToNewMapping}
      />
    );
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
 * @returns {undefined}
 */
function composer(props, onData) {
  Meteor.subscribe("Mappings").ready();
  return onData(null, { ...props });
}

registerComponent("CSVConnector", CSVConnectorContainer, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(CSVConnectorContainer);
