import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Logger } from "/client/api";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookReview extends Component {
  static propTypes = {
    /**
     * Add the address to database
     */
    add: PropTypes.func,
    /**
     * Add address reducer calls meteor method
     */
    switchMode: PropTypes.func,
    /**
     * array of address objects
     */
    validationResults: PropTypes.shape({
      enteredAddress: PropTypes.shape({
        _id: PropTypes.String,
        fullName: PropTypes.String,
        address1: PropTypes.String,
        addresss2: PropTypes.String,
        postal: PropTypes.String,
        city: PropTypes.String,
        region: PropTypes.String,
        country: PropTypes.String,
        phone: PropTypes.String,
        isBillingDefault: PropTypes.Bool,
        isShippingDefault: PropTypes.Bool,
        isCommercal: PropTypes.Bool
      }),
      suggestedAddress: PropTypes.shape({
        _id: PropTypes.String,
        fullName: PropTypes.String,
        address1: PropTypes.String,
        addresss2: PropTypes.String,
        postal: PropTypes.String,
        city: PropTypes.String,
        region: PropTypes.String,
        country: PropTypes.String,
        phone: PropTypes.String,
        isBillingDefault: PropTypes.Bool,
        isShippingDefault: PropTypes.Bool,
        isCommercal: PropTypes.Bool
      }),
      /**
       * map of all fields and
       * errors in them.
       */
      fieldErrors: PropTypes.object
    })
  }

  // Select the entered address by default.
  state = {
    isEnteredSelected: false
  }

  handleSelection = (event) => {
    event.preventDefault();
    let address = this.props.validationResults.enteredAddress;
    if (!this.state.isEnteredSelected) {
      address = this.props.validationResults.suggestedAddress;
      Meteor.call("accounts/markAddressValidationBypassed", false, (error) => {
        if (error) {
          return Logger.error(error, "Unable to mark the cart");
        }
        Meteor.call("accounts/markTaxCalculationFailed", false, (err) => {
          if (err) {
            return Logger.error(err, "Unable to mark the cart");
          }
        });
      });
    } else {
      Meteor.call("accounts/markAddressValidationBypassed", true, (error) => {
        if (error) {
          return Logger.error(error, "Unable to mark the cart");
        }
      });
    }
    this.props.add(address, false);
  };

  /**
   * @method handleEdit
   * @summary takes user back to the edit address screen
   * @since 2.0.0
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
    const radioTextEntered = "Entered Address";
    const radioTextSuggested = "Suggested Address";
    const { isEnteredSelected } = this.state;
    return (
      <div className="address-review">
        <div className="alert alert-warning">
          <Components.Translation
            defaultValue={`The address you entered may be incorrect or incomplete.
              Please review our suggestions below, and choose which version you'd like to use. Errors are shown in red.`}
            i18nKey=""
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
              <Components.Translation defaultValue={radioTextEntered}/>
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
              <Components.Translation defaultValue={radioTextSuggested}/>
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
              // i18nKeyLabel={this.props.i18nKeyLabel}
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
              Edit entered address
            </div>
          </div>
        </form>
      </div>
    );
  }
}


registerComponent("AddressBookReview", AddressBookReview);

export default AddressBookReview;

