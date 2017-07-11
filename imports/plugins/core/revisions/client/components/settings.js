import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation } from "/imports/plugins/core/ui/client/components";


class RevisionControlSettings extends Component {
  get settings() {
    return this.props.settings;
  }

  render() {
    let message;

    if (this.settings.general.enabled) {
      message = (
        <Translation
          defaultValue="Revision controls is enabled"
          i18nKey="revisions.isEnabled"
        />
      );
    } else {
      message = (
        <Translation
          defaultValue="Revision controls is disabled"
          i18nKey="revisions.isDisabled"
        />
      );
    }

    return (
      <div className="rui publish-controls">
        <p className="help-text">{message}</p>
      </div>
    );
  }
}

RevisionControlSettings.propTypes = {
  checked: PropTypes.bool,
  label: PropTypes.string,
  onUpdateSettings: PropTypes.func,
  settings: PropTypes.object
};

export default RevisionControlSettings;
