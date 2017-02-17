/**
 * Settings Card is a composite component to standardize the
 * creation settings cards (panels) in the dashboard.
 */

import React, { Component, PropTypes } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";

class SettingsCard extends Component {
  static propTypes = {
    children: PropTypes.node,
    enabled: PropTypes.bool,
    expanded: PropTypes.bool,
    i18nKeyTitle: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    onExpand: PropTypes.func,
    onSwitchChange: PropTypes.func,
    template: PropTypes.any,
    title: PropTypes.string
  }

  handleSwitchChange = (event, isChecked) => {
    if (typeof this.props.onSwitchChange === "function") {
      this.props.onSwitchChange(isChecked, this.props.name, this);
    }
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
        onExpand={this.props.onExpand}
        expanded={this.props.expanded}
        name={this.props.name}
      >
        <CardHeader
          i18nKeyTitle={this.props.i18nKeyTitle}
          icon={this.props.icon}
          title={this.props.title}
          showSwitch={true}
          actAsExpander={true}
          switchOn={this.props.enabled}
          switchName={this.props.name}
          expandOnSwitchOn={true}
          onSwitchChange={this.handleSwitchChange}
        />
        <CardBody expandable={true}>
          {this.renderCardBody()}
        </CardBody>
      </Card>
    );
  }
}

export default SettingsCard;
