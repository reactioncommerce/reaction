import React, { Component, PropTypes } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Checkbox
} from "/imports/plugins/core/ui/client/components";
import _set from "lodash/set";


class RevisionControlSettings extends Component {
  get settings() {
    return this.props.settings;
  }

  handleChange = (event, value, fieldName) => {
    if (this.props.onUpdateSettings) {
      const settingsCopy = Object.assign({}, this.props.settings);
      _set(settingsCopy, fieldName, value);
      this.props.onUpdateSettings(settingsCopy);
    }
  }

  render() {
    return (
      <Card className="rui publish-controls">
        <CardHeader
          i18nKeyTitle="revisions.general"
          title="General"
        />
        <CardBody>
          <Checkbox
            checked={this.settings.general.enabled}
            i18nKeyLabel="revisions.enableRevisionControl"
            label="Enable revision control"
            name="general.enabled"
            onChange={this.handleChange}
          />
        </CardBody>
      </Card>
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
