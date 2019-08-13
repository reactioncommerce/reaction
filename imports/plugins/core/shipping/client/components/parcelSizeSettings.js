import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { ShippingParcel } from "/lib/collections/schemas";


/**
 * @file ParcelSizeSettings - React Component wrapper for shop default parcel size form displayed in shipping settings
 * @module ParcelSizeSettings
 * @extends Component
*/
class ParcelSizeSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      settings: props.doc
    };
  }

  /**
  * @name handleSubmit
  * @summary Handle form submission
  * @param {Object} event - onChange event when typing in input field
  * @param {Object} formData - the data of the whole form
  * @returns {function} state for field value
  */
  handleSubmit = (event, formData) => {
    const parcel = formData.doc;
    this.props.saveDefaultSize(parcel);
  }

  /**
  * @name handleCardExpand
  * @summary Handle card expansion
  * @param {Object} event - onChange event when expander is clicked
  * @param {Object} card - card component
  * @param {String} cardName - card name
  * @param {Boolean} isExpanded - boolean value from card component
  * @returns {undefined}
  */
  handleCardExpand = (event, card, cardName, isExpanded) => {
    if (this.props.onCardExpand) {
      this.props.onCardExpand(isExpanded ? cardName : undefined);
      this.setState({
        expanded: this.props.getEditFocus() === cardName
      });
    }
  }

  /**
  * @name renderComponent
  * @summary React component for displaying default parcel size form
  * @returns {Node} React node containing form view
  */
  render() {
    const { hiddenFields, shownFields, fieldsProp } = this.props;
    return (
      <div className="parcel-setting">
        <Components.CardGroup>
          <Components.Card
            expanded={this.state.expanded}
            name={"parcelSize"}
            onExpand={this.handleCardExpand}
          >
            <Components.CardHeader
              actAsExpander={true}
              i18nKeyTitle="defaultParcelSize.label"
              title="Default Parcel Size"
            />
            <Components.CardBody expandable={true}>
              <Components.Form
                autoSave
                renderFromFields
                fieldsProp={fieldsProp}
                onSubmit={this.handleSubmit}
                schema={ShippingParcel}
                doc={this.state.settings}
                fields={shownFields}
                hideFields={hiddenFields}
              />
            </Components.CardBody>
          </Components.Card>
        </Components.CardGroup>
      </div>
    );
  }
}

/**
  * @name ParcelSizeSettings propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Function} doc the parcel object
  * @property {Object} fieldsProp properties of the fields
  * @property {Function} getEditFocus provides function that gets edit/focus value in Reaction state
  * @property {Array} hiddenFields fields not to be shown
  * @property {Function} onCardExpand provides function that controls card expansion
  * @property {Function} saveDefaultSize provides function / action when form is submitted
  * @property {Object} shownFields fields to be shown and how to be shown
  * @returns {Array} React propTypes
*/

ParcelSizeSettings.propTypes = {
  doc: PropTypes.shape({
    weight: PropTypes.number,
    height: PropTypes.number,
    length: PropTypes.number,
    width: PropTypes.number
  }),
  fieldsProp: PropTypes.object,
  getEditFocus: PropTypes.func,
  hiddenFields: PropTypes.array,
  onCardExpand: PropTypes.func,
  saveDefaultSize: PropTypes.func,
  shownFields: PropTypes.object
};

registerComponent("ParcelSizeSettings", ParcelSizeSettings);

export default ParcelSizeSettings;
