import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
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
      fieldErrors: PropTypes.object
    })
  }

  state = {
    isEnteredSelected: false
  }

  handleSelection = (event) => {
    event.preventDefault();
    let address = this.props.validationResults.enteredAddress;
    if (!this.state.isEnteredSelected) {
      address = this.props.validationResults.suggestedAddress;
    } else {
      Meteor.call("accounts/markAddressValidationBypassed", (error, result) => {
        if (error) {
          return Logger.error(error, "Unable to mark the cart");
        }
        Meteor.call("accounts/markTaxCalculationFailed", (err, res) => {
          if (err) {
            return Logger.error(err, "Unable to mark the cart");
          }
        });
      });
    }
    this.props.add(address, false).catch(console.log);
  };

  handleEdit = (event) => {
    event.preventDefault();
    this.props.switchMode("entry", this.props.validationResults.enteredAddress);
  }

  selectEntered = () => {
    this.setState({
      isEnteredSelected: true
    });
  }

  selectSuggested = () => {
    this.setState({
      isEnteredSelected: false
    });
  }

  renderField(field, value, showError) {
    const { fieldErrors } = this.props.validationResults;
    if (showError && fieldErrors[field] && fieldErrors[field].length > 0) {
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
    // i18nKey={}
    return (
      <div className="address-review">
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

