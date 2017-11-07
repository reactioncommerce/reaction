import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

/**
 * @class ParcelDimensionSettings
 * @extends {Component}
 */
class ParcelDimensionSettings extends Component {
  static propTypes = {
    saveDefaultSize: PropTypes.func,
    size: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      size: this.props.size,
      isEditing: false,
      isSaving: false
    };
    this.handleFieldFocus = this.handleFieldFocus.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * @memberof ParcelDimensionSettings
   */
  handleFieldFocus() {
    this.setState({
      isEditing: true
    });
  }
  /**
   * @param {Object} event
   * @memberof ParcelDimensionSettings
   */
  handleStateChange(event) {
    const { size } = this.state;
    const value = event.target.value;
    size[event.target.name] = value;
    this.setState({ size });
  }

  /**
   * @param {Object} event
   * @memberof ParcelDimensionSettings
   */
  handleSubmit(event) {
    event.preventDefault();
    const { size } = this.state;
    const shopId = Reaction.getShopId();
    this.setState({ isSaving: true });
    this.props.saveDefaultSize(shopId, size, () => {
      this.setState({ isSaving: false });
    });
  }

  render() {
    const { isEditing, isSaving, size } = this.state;
    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="admin.settings.label"
            title="Parcel Size"
          />
          <Components.CardBody expandable={true}>
            <form onSubmit={this.handleSubmit}>
              <Components.TextField
                label="Weight"
                type="text"
                i18nKeyLabel="admin.settings.weight"
                name="weight"
                value={size.weight}
                onChange={this.handleStateChange}
                onFocus={this.handleFieldFocus}
              />
              <Components.TextField
                label="Height"
                type="text"
                i18nKeyLabel="admin.settings.height"
                name="height"
                value={size.height}
                onChange={this.handleStateChange}
                onFocus={this.handleFieldFocus}
              />
              <Components.TextField
                label="Width"
                type="text"
                i18nKeyLabel="admin.settings.width"
                name="width"
                value={size.width}
                onChange={this.handleStateChange}
                onFocus={this.handleFieldFocus}
              />
              <Components.TextField
                label="Length"
                type="text"
                i18nKeyLabel="admin.settings.length"
                name="length"
                value={size.length}
                onChange={this.handleStateChange}
                onFocus={this.handleFieldFocus}
              />
              {isEditing &&
                <Components.Button
                  bezelStyle="solid"
                  status="primary"
                  className="pull-right"
                  type="submit" disabled={isSaving}
                >
                  {isSaving ?
                    <i className="fa fa-refresh fa-spin" />
                    : <span data-i18n="app.save">Save</span>}
                </Components.Button>
              }
            </form>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

export default ParcelDimensionSettings;
