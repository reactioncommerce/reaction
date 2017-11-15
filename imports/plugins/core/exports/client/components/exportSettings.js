import React, { Component } from "react";
import PropTypes from "prop-types";


class ExportSettings extends Component {
  constructor(props) {
    super(props);

    this.isChecked = this.isChecked.bind(this);
  }

  isChecked() {
    // TODO Yet to define the condtion properly
    if (true) {
      return "checked";
    }
    return "";
  }

  isShown() {
    // TODO Yet to define the condtion properly
    if (false) {
      return "hidden";
    }
    return "";
  }
  render() {
    const renderExportMethods = () => {
      if (this.props.exportSettings) {
        return (
          <div className="panel panel-default">
            <div className="panel-heading">
              <div className="panel-title">
                <i className="fa fa-download" />
                <span data-i18n="">Simple CSV Export Mock</span>
              </div>
              <div className="panel-controls">
                <input className="checkbox-switch" type="checkbox" name="enabled" data-id=""
                  data-key="" defaultChecked
                />
              </div>
            </div>
          </div>
        );
      }
      return (
        <h4>No more export methods</h4>
      );
    };
    return  (
      <div className="panel-group" id="paymentSettingsAccordian" role="tablist" aria-multiselectable="true">
        <div className="panel panel-default">
          <div className="panel-heading">
            <div className="panel-title">
              <i className="fa fa-download" />
              <span data-i18n="">Simple CSV Export Mock</span>
            </div>
            <div className="panel-controls">
              <input className="checkbox-switch" type="checkbox" name="enabled" data-id=""
                data-key="" defaultChecked
              />
            </div>
          </div>
        </div>
        {renderExportMethods()}
      </div>
    );
  }
}

ExportSettings.propTypes = {
  exportSettings: PropTypes.object
};

export default ExportSettings;
