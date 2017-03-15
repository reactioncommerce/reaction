/**
 * Settings Card is a composite component to standardize the
 * creation settings cards (panels) in the dashboard.
 */

import React, { Component, PropTypes } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";

class SettingsCard extends Component {
  static defaultProps = {
    showSwitch: true
  }

  static propTypes = {
    children: PropTypes.node,
    enabled: PropTypes.bool,
    expanded: PropTypes.bool,
    i18nKeyTitle: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    onExpand: PropTypes.func,
    onSwitchChange: PropTypes.func,
    packageName: PropTypes.string,
    padded: PropTypes.bool,
    preferences: PropTypes.object,
    saveOpenStateToPreferences: PropTypes.bool,
    showSwitch: PropTypes.bool,
    template: PropTypes.any,
    title: PropTypes.string
  }

  handleSwitchChange = (event, isChecked) => {
    if (typeof this.props.onSwitchChange === "function") {
      this.props.onSwitchChange(event, isChecked, this.props.name, this);
    }
  }

  handleExpand = (event, card, name, isExpanded) => {
    if (this.props.onExpand) {
      this.props.onExpand(event, card, name, isExpanded);
    }

    if (this.props.packageName && this.props.saveOpenStateToPreferences) {
      Reaction.updateUserPreferences(this.props.packageName, "settingsCards", {
        [this.props.name]: isExpanded
      });
    }
  }

  get isExpanded() {
    if (this.props.packageName && this.props.saveOpenStateToPreferences) {
      return this.props.preferences[this.props.name];
    }

    return this.props.expanded;
  }

  renderCardBody() {
    if (this.props.template) {
      return (
        <Blaze template={this.props.template} />
      );
    }

    return this.props.children;
  }

  render() {
    return (
      <Card
        expandable={true}
        onExpand={this.handleExpand}
        expanded={this.isExpanded}
        name={this.props.name}
      >
        <CardHeader
          i18nKeyTitle={this.props.i18nKeyTitle}
          icon={this.props.icon}
          title={this.props.title}
          showSwitch={this.props.showSwitch}
          actAsExpander={true}
          switchOn={this.props.enabled}
          switchName={this.props.name}
          expandOnSwitchOn={true}
          onSwitchChange={this.handleSwitchChange}
        />
        <CardBody expandable={true} padded={this.props.padded}>
          {this.renderCardBody()}
        </CardBody>
      </Card>
    );
  }
}

function composer(props, onData) {
  if (props.packageName && props.saveOpenStateToPreferences) {
    const preferences = Reaction.getUserPreferences(props.packageName, "settingsCards", {});

    onData(null, {
      preferences
    });
  } else {
    onData(null, {});
  }
}

const decoratedComponent = composeWithTracker(composer)(SettingsCard);

export default decoratedComponent;
