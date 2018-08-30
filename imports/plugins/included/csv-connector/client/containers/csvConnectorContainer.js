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
      expanded: true,
      fileUpload: {},
      jobItem: {
        jobType: "import"
      },
      mappingOptions: [],
      showSettings: false
    };
  }

  handleCardExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  handleFileUpload = (acceptedFiles) => {
    const filesArray = Array.from(acceptedFiles);
    if (filesArray.length === 0) return;
    const fileUpload = filesArray[0];
    this.setState({ fileUpload });
  }

  handleSetActiveScreen = (activeScreen) => {
    this.setState({ activeScreen });
  }

  handleSetJobItemField = (field, value) => {
    const { jobItem } = this.state;
    const newValue = {};
    newValue[field] = value;
    const newJobItem = {
      ...jobItem,
      ...newValue
    };

    this.setState({ jobItem: newJobItem });

    if (field === "collection") {
      const mappings = Mappings.find({ collection: value }).fetch();
      const mappingOptions = mappings.map((mapping) => ({ value: mapping._id, label: mapping.name }));
      mappingOptions.push({
        value: "create",
        label: "Create new mapping"
      });
      this.setState({ mappingOptions });
    }
  }

  handleSubmitJobItem = () => {
    return;
  }

  toggleSettings = () => {
    this.setState({ showSettings: !this.state.showSettings });
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

  renderJobItemScreen() {
    const {
      activeScreen,
      dataTypeOptions,
      fileUpload: {
        name: fileName
      },
      jobItem,
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
          fileName={fileName || ""}
          jobItem={jobItem}
          mappingOptions={mappingOptions}
          onDone={this.handleSubmitJobItem}
          onFileUpload={this.handleFileUpload}
          onSetActiveScreen={this.handleSetActiveScreen}
          onSetJobItemField={this.handleSetJobItemField}
        />
      );
    }
    return (
      <MappingScreen
        jobItem={jobItem}
        onDone={this.handleSubmitJobItem}
        onSetActiveScreen={this.handleSetActiveScreen}
      />
    );
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
            <div className="pull-right">
              <Components.IconButton
                icon="fa fa-gear"
                onClick={this.toggleSettings}
              />
            </div>
            {this.renderJobItemScreen()}
            {this.renderSettings()}
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

export default compose(composeWithTracker(composer), )(CSVConnectorContainer);
