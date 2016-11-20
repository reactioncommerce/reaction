import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import SettingsComponent from "../components/settings";
import { Packages } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider";


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
   * @param  {Object} props Component props
   * @return {PropTypes.node} react node
   */
  render() {
    // console.log(this.props.packageInfo);
    return (
      <div>
        <TranslationProvider>
          <SettingsComponent
            onUpdateSettings={this.handleUpdateSettings}
            settings={this.settings}
          />
        </TranslationProvider>
      </div>
    );
  }
}

RevisionSettingsContainer.propTypes = {
  packageInfo: PropTypes.object
};

export function handlePublishClick(revisions) {
  if (Array.isArray(revisions)) {
    const documentIds = revisions.map((revision) => {
      return revision.documentId;
    });
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
