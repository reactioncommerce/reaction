import React, { Component } from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import S3SettingsContainer from "./s3SettingsContainer";
import SFTPSettingsContainer from "./sftpSettingsContainer";

export default class CSVConnectorContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      showSettings: false
    };
  }

  toggleSettings = () => {
    this.setState({ showSettings: !this.state.showSettings });
  }

  handleCardExpand = () => {
    this.setState({ expanded: !this.state.expanded });
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
            {this.renderSettings()}
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

registerComponent("CSVConnector", CSVConnectorContainer);
