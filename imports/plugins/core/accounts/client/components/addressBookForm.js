import React, { Component } from "react";
import PropTypes from "prop-types";
import { Countries, Shops } from "/client/collections";
import * as Collections from "/lib/collections";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookForm extends Component {
  static propTypes = {
    add: PropTypes.func, // add addess callback
    cancel: PropTypes.func, // cancel address entry and render AddressBookGrid
    editAddress: PropTypes.object, // address object
    hasAddress: PropTypes.bool // has address in addressBook
  }

  state = {
    countries: [],
    regions: [],
    fields: {
      country: this.props.editAddress.country || "US", // defaults to United States
      fullName: this.props.editAddress.fullName || "",
      address1: this.props.editAddress.address1 || "",
      address2: this.props.editAddress.address2 || "",
      postal: this.props.editAddress.postal || "",
      city: this.props.editAddress.city || "",
      region: this.props.editAddress.region || "",
      phone: this.props.editAddress.phone || "",
      isShippingDefault: this.props.editAddress.isShippingDefault || (!this.props.hasAddress),
      isBillingDefault: this.props.editAddress.isBillingDefault || (!this.props.hasAddress),
      isCommercial: this.props.editAddress.isCommercial || false
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

  renderAddressOptions() {
    const { hasAddress } = this.props;
    const { fields } = this.state;

    let defaultOptions;
    if (hasAddress) {
      defaultOptions = (
        <div>
          <div className="form-group">
            <span className="control-label" />
            <div className="checkbox">
              <Components.Checkbox
                label="Make this your default shipping address."
                name="isShippingDefault"
                onChange={this.onFieldChange}
                checked={fields.isShippingDefault}
                />
            </div>
          </div>
          <div className="form-group">
            <span className="control-label" />
            <div className="checkbox">
              <Components.Checkbox
                label="Make this your default billing address."
                name="isBillingDefault"
                onChange={this.onFieldChange}
                checked={fields.isBillingDefault}
                />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="row address-options" style={{ paddingLeft: "5px" }}>
        <div className="col-md-12">
          {defaultOptions}
          <div className="form-group">
            <div className="checkbox">
              <Components.Checkbox
                label="This is a commercal address."
                name="isCommercial"
                onChange={this.onFieldChange}
                checked={fields.isCommercial}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderButtons() {
    const { cancel } = this.props;
    // TODO: use translation component for button text!
    return (
      <div className="row text-right">
        <button className="btn btn-primary" data-i18n="app.saveAndContinue">Save and continue</button>
        <button type="reset" className="btn btn-default" data-i18n="app.cancel" onClick={cancel}>Cancel</button>
      </div>
    );
  }

  render() {
    const { countries, regions, fields } = this.state;
    console.log("React AddressBookForm", this.props, this.state);
    return (
      <form onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-md-6">
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
          <div className="col-md-6">
            <Components.TextField
              label="Full Name"
              name="fullName"
              onChange={this.onFieldChange}
              value={fields.fullName}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Components.TextField
              label="Address"
              name="address1"
              onChange={this.onFieldChange}
              value={fields.address1}
            />
          </div>
          <div className="col-md-6">
            <Components.TextField
              label="Address"
              name="address2"
              onChange={this.onFieldChange}
              value={fields.address2}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Components.TextField
              label="Postal"
              name="postal"
              onChange={this.onFieldChange}
              value={fields.postal}
            />
          </div>
          <div className="col-md-4">
            <Components.TextField
              label="City"
              name="city"
              onChange={this.onFieldChange}
              value={fields.city}
            />
          </div>
          <div className="col-md-4">
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
          <div className="col-md-4">
            <Components.TextField
              label="Phone"
              name="phone"
              onChange={this.onFieldChange}
              value={fields.phone}
            />
          </div>
        </div>

        {this.renderAddressOptions()}
        {this.renderButtons()}
      </form>
    );
  }
}

registerComponent("AddressBookForm", AddressBookForm);

export default AddressBookForm;
