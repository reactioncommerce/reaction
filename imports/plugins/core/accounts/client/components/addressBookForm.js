import React, { Component } from "react";
import PropTypes from "prop-types";
import { Countries, Shops } from "/client/collections";
import * as Collections from "/lib/collections";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookForm extends Component {
  static propTypes = {
    add: PropTypes.func, // add addess callback
    editAddress: PropTypes.object // address object
  }

  state = {
    countries: [],
    regions: [],
    fields: {
      country: "US", // defaults to United States
      fullName: "",
      address1: "",
      address2: "",
      postal: "",
      city: "",
      region: "",
      phone: "",
      isShippingDefault: false,
      isBillingDefault: false,
      isCommercial: false
    }
  }

  componentWillMount() {
    const { fields: { country } } = this.state;
    const countries = Countries.find().fetch();
    this.setState({ countries });
    if (country === "US" || country === "DE" || country === "CA") this.regionOptions();
  }

  // creating region options
  regionOptions() {
    const { fields: { country } } = this.state;
    const shop = Collections.Shops.findOne();
    const rawRegions = shop.locales.countries[country].states;
    const regions = [];
    Object.keys(rawRegions).forEach((key) => {
      regions.push({
        label: rawRegions[key].name,
        value: key
      });
    });
    this.setState({ regions });
  }

  // on submit event handler
  onSubmit = (event) => {
    event.preventDefault();
    const { add } = this.props;
    const { fields: enteredAddress } = this.state;
    add(enteredAddress);
  }

  // on field change handler
  onFieldChange = (event, value, name) => {
    const { fields } = this.state;
    fields[name] = value;
    this.setState({ fields });
  }

  onSelectChange = (value, name) => {
    // the reaction select component doesn't return
    // the same values as the other field components
    // this updates that return and calls the
    // typical on field change handler
    this.onFieldChange(new Event("onSelect"), value, name);
  }

  renderButtons() {
    // TODO: use translation component for button text!
    return (
      <div className="row text-right">
        <button className="btn btn-primary" data-i18n="app.saveAndContinue">Save and continue</button>
        <button type="reset" className="btn btn-default" data-i18n="app.cancel">Cancel</button>
      </div>
    );
  }

  render() {
    const { countries, regions, fields } = this.state;
    // console.log("React AddressBookForm", this.props, this.state);
    return (
      <form onSubmit={this.onSubmit}>

        <div className="row">
          <div className="col-md-6 form-group">
            <Components.Select
              label="Country"
              name="country"
              options={countries}
              onChange={this.onSelectChange}
              placeholder="Country"
              value={fields.country}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 form-group">
            <Components.TextField
              label="Full Name"
              name="fullName"
              onChange={this.onFieldChange}
              value={fields.fullName}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 form-group">
            <Components.TextField
              label="Address"
              name="address1"
              onChange={this.onFieldChange}
              value={fields.address1}
            />
          </div>
          <div className="col-md-6 form-group">
            <Components.TextField
              label="Address"
              name="address2"
              onChange={this.onFieldChange}
              value={fields.address2}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 form-group">
            <Components.TextField
              label="Postal"
              name="postal"
              onChange={this.onFieldChange}
              value={fields.postal}
            />
          </div>
          <div className="col-md-4 form-group">
            <Components.TextField
              label="City"
              name="city"
              onChange={this.onFieldChange}
              value={fields.city}
            />
          </div>
          <div className="col-md-4 form-group">
            <Components.Select
              label="Region"
              name="region"
              options={regions}
              onChange={this.onSelectChange}
              value={fields.region}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 form-group">
            <Components.TextField
              label="Phone"
              name="phone"
              onChange={this.onFieldChange}
              value={fields.phone}
            />
          </div>
        </div>

        <div className="row address-options">
          <Components.Checkbox
            label="This is a Commercal Address."
            name="isCommercial"
            onChange={this.onChange}
            checked={fields.isCommercial}
          />
        </div>

        {this.renderButtons()}
      </form>
    );
  }
}

registerComponent("AddressBookForm", AddressBookForm);

export default AddressBookForm;
