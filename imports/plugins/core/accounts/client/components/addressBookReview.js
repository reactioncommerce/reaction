import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookReview extends Component {
  static propTypes = {
    // Add the address to database
    add: PropTypes.func,
    // Marks the address as bypassed.
    markCart: PropTypes.func,
    // Add address reducer calls meteor method
    switchMode: PropTypes.func,
    // array of address objects
    validationResults: PropTypes.shape({
      enteredAddress: PropTypes.shape({
        _id: PropTypes.string,
        fullName: PropTypes.string,
        address1: PropTypes.string,
        address2: PropTypes.string,
        postal: PropTypes.string,
        city: PropTypes.string,
        region: PropTypes.string,
        country: PropTypes.string,
        phone: PropTypes.string,
        isBillingDefault: PropTypes.bool,
        isShippingDefault: PropTypes.bool,
        isCommercal: PropTypes.bool
      }),
      suggestedAddress: PropTypes.shape({
        _id: PropTypes.string,
        fullName: PropTypes.string,
        address1: PropTypes.string,
        address2: PropTypes.string,
        postal: PropTypes.string,
        city: PropTypes.string,
        region: PropTypes.string,
        country: PropTypes.string,
        phone: PropTypes.string,
        isBillingDefault: PropTypes.bool,
        isShippingDefault: PropTypes.bool,
        isCommercal: PropTypes.bool
      }),
      /**
       * A map of all fields and errors in them.
       * @ignore
       */
      fieldErrors: PropTypes.object
    })
  }

  // Select the entered address by default.
  state = {
    isEnteredSelected: false
  }

  /**
   * @method handleSelection
   * @summary either saves the suggested or entered address
   * @since 2.0.0
   * @ignore
   */
  handleSelection = (event) => {
    event.preventDefault();
    let address = this.props.validationResults.enteredAddress;
    if (!this.state.isEnteredSelected) {
      address = this.props.validationResults.suggestedAddress;
    }
    if (typeof this.props.markCart === "function") {
      this.props.markCart(address, this.state.isEnteredSelected);
    }
    if (typeof this.props.add === "function") {
      this.props.add(address, false);
    }
  };

  /**
   * @method handleEdit
   * @summary takes user back to the edit address screen
   * @since 2.0.0
   * @ignore
   */
  handleEdit = (event) => {
    event.preventDefault();
    if (this.props.switchMode) {
      this.props.switchMode("entry", this.props.validationResults.enteredAddress);
    }
  }

  /**
   * @method selectEntered
   * @summary select the entered address
   * @since 2.0.0
   * @ignore
   */
  selectEntered = () => {
    this.setState({
      isEnteredSelected: true
    });
  }

  /**
   * @method selectSuggested
   * @summary select the suggested address
   * @since 2.0.0
   * @ignore
   */
  selectSuggested = () => {
    this.setState({
      isEnteredSelected: false
    });
  }

  /**
   * @method renderField
   * @summary renders a field in the address
   * with error if present
   * @since 2.0.0
   * @return {Object} - JSX and child component.
   * @ignore
   */
  renderField(field, value, showError) {
    const { fieldErrors } = this.props.validationResults;
    if (showError && fieldErrors && fieldErrors[field] && fieldErrors[field].length > 0) {
      return (
        <div >
          <div className="error">
            {value}
          </div>
        </div>
      );
    }
    return (
      <div>
        {value}
      </div>
    );
  }

  render() {
    const { enteredAddress, suggestedAddress } = this.props.validationResults;
    const { isEnteredSelected } = this.state;
    return (
      <div className="address-review">
        <div className="alert alert-warning">
          <Components.Translation
            defaultValue={`The address you entered may be incorrect or incomplete.
              Please review our suggestions below, and choose which version you'd like to use. Errors are shown in red.`}
            i18nKey="addressBookReview.warning"
          />
        </div>
        <form>
          <div className="entered-address">
            <div className="radio-heading">
              <input
                type="radio"
                value="entered"
                name="chooseAddress"
                checked={isEnteredSelected}
                onChange={this.selectEntered}
              />
              <Components.Translation defaultValue="Entered Address" i18nKey="addressBookReview.enteredAddress"/>
            </div>
            {this.renderField("address1", enteredAddress.address1, true)}
            {this.renderField("address2", enteredAddress.address2, true)}
            {this.renderField("city", enteredAddress.city, true)}
            {this.renderField("country", enteredAddress.country, true)}
            {this.renderField("postal", enteredAddress.postal, true)}
            {this.renderField("region", enteredAddress.region, true)}
          </div>
          <div className="suggested-address">
            <div className="radio-heading">
              <input
                type="radio"
                value="suggested"
                name="chooseAddress"
                checked={!isEnteredSelected}
                onChange={this.selectSuggested}
              />
              <Components.Translation defaultValue="Suggested Address" i18nKey="addressBookReview.suggestedAddress"/>
            </div>
            {this.renderField("address1", suggestedAddress.address1, false)}
            {this.renderField("address2", suggestedAddress.address2, false)}
            {this.renderField("city", suggestedAddress.city, false)}
            {this.renderField("country", suggestedAddress.country, false)}
            {this.renderField("postal", suggestedAddress.postal, false)}
            {this.renderField("region", suggestedAddress.region, false)}
          </div>
          <div className="panel-buttons">
            <Components.Button
              status="primary"
              buttonType="submit"
              onClick={this.handleSelection}
              bezelStyle="solid"
              i18nKeyLabel="addressBookReview.useSelectedAddress"
              label="Use selected address"
              id="reviewAddressSelectButton"
            />
            <div
              id="reviewAddressEditButton"
              role="button"
              onClick={this.handleEdit}
              onKeyDown={this.handleEdit}
              tabIndex={0}
            >
              <Components.Translation defaultValue="Edit entered address" i18nKey="addressBookReview.editAddress"/>
            </div>
          </div>
        </form>
      </div>
    );
  }
}


registerComponent("AddressBookReview", AddressBookReview);

export default AddressBookReview;

