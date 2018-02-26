import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import SettingsComponent from "../components/settings";
import { Packages } from "/lib/collections";

class RevisionSettingsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: this.props.packageInfo.settings
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      settings: nextProps.packageInfo.settings
    });
  }

  get settings() {
    return this.state.settings;
  }

  handleUpdateSettings = (settings) => {
    this.setState({ settings }, () => {
      Meteor.call("revisions/settings/update", settings);
    });
  }

  /**
   * Publish container is a stateless container component connected to Meteor data source.
   * @return {PropTypes.node} react node
   */
  render() {
    return (
      <div>
        <SettingsComponent
          onUpdateSettings={this.handleUpdateSettings}
          settings={this.settings}
        />
      </div>
    );
  }
}

RevisionSettingsContainer.propTypes = {
  packageInfo: PropTypes.object
};

export function handlePublishClick(revisions) {
  if (Array.isArray(revisions)) {
    const documentIds = revisions.map((revision) => revision.documentId);
    Meteor.call("revisions/publish", documentIds);
  }
}

function composer(props, onData) {
  const packageInfo = Packages.findOne({
    name: "reaction-revisions"
  });

  onData(null, {
    packageInfo
  });
}

export default composeWithTracker(composer)(RevisionSettingsContainer);
