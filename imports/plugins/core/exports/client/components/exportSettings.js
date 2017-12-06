import React, { Component } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";
import PropTypes from "prop-types";


class ExportSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false
    };
    this.isChecked = this.isChecked.bind(this);
  }

  isChecked() {
    this.setState({
      checked: !this.state.checked
    });
  }

  render() {
    return  (
      <div className="panel-group" id="exportSettingsAccordian" role="tablist" aria-multiselectable="true">
        {this.props.exportSettings.map(exportSetting => (
          <div className="panel panel-default" key={exportSetting.settingsKey}>
            <div className="panel-heading panel-heading-flex">
              <div className="panel-title content-view">
                <span data-i18n={exportSetting.i18nKeyLabel}>{exportSetting.label}</span>
              </div>
              <div className="panel-controls">
                <input className="checkbox-switch" type="checkbox" name="enabled"
                  onChange={this.isChecked} data-id={exportSetting.packageId}
                  data-key={exportSetting.settingsKey} checked={this.state.checked}
                />
              </div>
            </div>
            {this.state.checked ?
              <div className="panel-body">
                <Blaze template={exportSetting.template} />
              </div>
              :
              <div className="panel-body" />
            }
          </div>
        ))}
      </div>
    );
  }
}

ExportSettings.propTypes = {
  exportSettings: PropTypes.array
};

export default ExportSettings;
