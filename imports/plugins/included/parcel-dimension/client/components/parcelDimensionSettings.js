import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";

class ParcelDimensionSettings extends Component {
  constructor() {
    super();
    this.state = {
      settings: {},
      isSaving: false
    };
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleStateChange(event) {
    const { settings } = this.state;
    settings[event.target.name] = event.target.value;
    this.setState({ settings });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ isSaving: true });
    console.log("submit form: ", event);
  }

  render() {
    const { isSaving, settings } = this.state;

    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardBody expandable={true}>
            <form onSubmit={this.handleSubmit}>
              <Components.TextField
                label="Weight"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.weight"
                name="weight"
                value={settings.weight || ""}
                onChange={this.handleStateChange}
              />
              <Components.TextField
                label="Height"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.height"
                name="height"
                value={settings.height || ""}
                onChange={this.handleStateChange}
              />
              <Components.TextField
                label="Width"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.width"
                name="width"
                value={settings.width || ""}
                onChange={this.handleStateChange}
              />
              <Components.TextField
                label="Length"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.length"
                name="length"
                value={settings.length || ""}
                onChange={this.handleStateChange}
              />
              <Components.Button
                bezelStyle="solid"
                status="primary"
                className="pull-right"
                type="submit" disabled={isSaving}
              >
                {isSaving ?
                  <i className="fa fa-refresh fa-spin"/>
                  : <span data-i18n="app.save">Save</span>}
              </Components.Button>
            </form>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

export default ParcelDimensionSettings;
