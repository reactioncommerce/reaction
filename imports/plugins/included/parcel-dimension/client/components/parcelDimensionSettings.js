import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

class ParcelDimensionSettings extends Component {
  constructor() {
    super();
    this.state = {
      dimension: {},
      isSaving: false
    };
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleStateChange(event) {
    const { dimension } = this.state;
    const value = event.target.value;
    dimension[event.target.name] = parseInt(value, 10);
    this.setState({ dimension });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { dimension } = this.state;
    dimension._id = Reaction.getShopId();
    Meteor.call("shipping/dimension/add", dimension);
    this.setState({ isSaving: true });
  }

  render() {
    const { isSaving, dimension } = this.state;

    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardBody expandable={true}>
            <form onSubmit={this.handleSubmit}>
              <Components.TextField
                label="Weight"
                type={"number"}
                i18nKeyLabel="admin.parcelDimensionSettings.weight"
                name="weight"
                value={dimension.weight || 0}
                onChange={this.handleStateChange}
              />
              <Components.TextField
                label="Height"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.height"
                name="height"
                value={dimension.height || 0}
                onChange={this.handleStateChange}
              />
              <Components.TextField
                label="Width"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.width"
                name="width"
                value={dimension.width || 0}
                onChange={this.handleStateChange}
              />
              <Components.TextField
                label="Length"
                type="number"
                i18nKeyLabel="admin.parcelDimensionSettings.length"
                name="length"
                value={dimension.length || 0}
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
