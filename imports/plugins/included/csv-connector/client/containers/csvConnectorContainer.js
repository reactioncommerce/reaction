import React, { Component } from "react";
import { compose } from "recompose";
import { Components, composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Mappings } from "../../lib/collections";
import { getDataTypeOptions } from "../../lib/common/conversionMaps";
import { DetailScreen, MappingScreen, StartScreen } from "../components";
import S3SettingsContainer from "./s3SettingsContainer";
import SFTPSettingsContainer from "./sftpSettingsContainer";

class CSVConnectorContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeScreen: "start",
      dataTypeOptions: getDataTypeOptions(),
      errors: {},
      expanded: true,
      jobItem: {
        jobType: "import",
        fileUpload: ""
      },
      mappingName: "",
      mappingOptions: [],
      showSettings: false
    };
  }

  getValidationErrors() {
    const { activeScreen, jobItem } = this.state;
    const { collection, fileUpload, name } = jobItem;
    const errors = {};
    if (activeScreen === "detail") {
      if (!name) {
        errors.name = [{ name: "name", message: "Job name is required." }];
      } else {
        errors.name = [];
      }
      if (!collection) {
        errors.collection = [{ name: "collection", message: "Data type is required." }];
      } else {
        errors.collection = [];
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

  handleSetJobItemField = (field, value) => {
    const { errors, jobItem, mappingOptions } = this.state;
    const newValue = {};
    newValue[field] = value;

    if (field === "collection") {
      if (value) {
        const mappings = Mappings.find({ collection: value }).fetch();
        const newMappingOptions = mappings.map((mapping) => ({ value: mapping._id, label: mapping.name }));
        newMappingOptions.push({
          value: "create",
          label: "Create new mapping"
        });
        this.setState({ mappingOptions: newMappingOptions });
        newValue.mappingId = newMappingOptions[0].value;
      } else {
        this.setState({ mappingOptions: [] });
        newValue.mappingId = "";
      }
    }

    if (field === "mappingId") {
      if (value === "create" || mappingOptions.length === 0) {
        this.setState({ mappingName: "" });
      } else {
        const selectedMapping = mappingOptions.find((option) => option.value === value);
        this.setState({ mappingName: selectedMapping.label });
      }
    }

    const newJobItem = {
      ...jobItem,
      ...newValue
    };

    this.setState({ jobItem: newJobItem }, () => {
      if (errors[field]) { // means that the field already had validation error before
        const newErrors = this.getValidationErrors();
        this.setState({ errors: newErrors });
      }
    });
  }

  handleSubmitJobItem = () => {
    return;
  }

  renderJobItemScreen() {
    const {
      activeScreen,
      errors,
      dataTypeOptions,
      jobItem,
      mappingName,
      mappingOptions,
      showSettings
    } = this.state;

    if (showSettings) {
      return null;
    }

    if (activeScreen === "start") {
      return (
        <StartScreen
          onSetActiveScreen={this.handleSetActiveScreen}
          onSetJobItemField={this.handleSetJobItemField}
          jobItem={jobItem}
        />
      );
    } else if (activeScreen === "detail") {
      return (
        <DetailScreen
          dataTypeOptions={dataTypeOptions}
          errors={errors}
          jobItem={jobItem}
          mappingOptions={mappingOptions}
          onDone={this.handleSubmitJobItem}
          onSetActiveScreen={this.handleSetActiveScreen}
          onSetJobItemField={this.handleSetJobItemField}
        />
      );
    }
    return (
      <MappingScreen
        jobItem={jobItem}
        mappingName={mappingName}
        onDone={this.handleSubmitJobItem}
        onSetActiveScreen={this.handleSetActiveScreen}
        onSetJobItemField={this.handleSetJobItemField}
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
