import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookForm extends Component {
  static propTypes = {
    /**
     * add addess callback
     */
    add: PropTypes.func,
    /**
     * cancel address entry and render AddressBookGrid
     */
    cancel: PropTypes.func,
    /**
     * country options for select
     */
    countries: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.String,
      value: PropTypes.String
    })),
    /**
     * address object
     */
    editAddress: PropTypes.object,
    /**
     * has address in addressBook
     */
    hasAddress: PropTypes.bool,
    /**
     * regions by county
     */
    regionsByCountry: PropTypes.Object
  }

  state = {
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
      isShippingDefault: this.props.editAddress.isShippingDefault || (!this.props.hasAddress), // no address, default to true
      isBillingDefault: this.props.editAddress.isBillingDefault || (!this.props.hasAddress), // no addres, default to true
      isCommercial: this.props.editAddress.isCommercial || false
    }
  }

  componentWillMount() {
    const { fields: { country } } = this.state;

    // if selected country has region options set those too
    this.setRegionOptions(country);
  }
  // Address Book Form helpers

  /**
   * @method setRegionOptions
   * @summary creates an array of region options for the regions select field.
   * @since 2.0.0
   * @param {String} country - country code "US" "CA" "JP"
   */
  setRegionOptions(country) {
    const { regionsByCountry } = this.props;
    const { fields } = this.state;
    const regions = regionsByCountry[country];
    // setting the fields region to be the
    // first region in options array
    const [firstRegion] = regions;
    fields.region = firstRegion;
    this.setState({ regions, fields });
  }

  // Address Book Form Actions

  /**
   * @method onSubmit
   * @summary takes the entered address and adds or updates it to the addressBook.
   * @since 2.0.0
   */
  onSubmit = (event) => {
    event.preventDefault();
    const { add } = this.props;
    const { fields: enteredAddress } = this.state; // fields object as enteredAddress
    // TODO: field validatiion
    add(enteredAddress);
  }

  /**
   * @method onFieldChange
   * @summary when field values change update the value in state
   * @since 2.0.0
   */
  onFieldChange = (event, value, name) => {
    const { fields } = this.state;
    fields[name] = value;
    this.setState({ fields });
    // if country changed set new region options
    if (name === "country") this.setRegionOptions(value);
  }

  /**
   * @method onSelectChange
   * @summary normalizes the select components onChange.
   * @since 2.0.0
   */
  onSelectChange = (value, name) => {
    // the reaction select component doesn't return
    // the same values as the other field components
    // this updates that return and calls the
    // typical on field change handler
    this.onFieldChange(new Event("onSelect"), value, name);
  }

  // Address Book Form JSX

  /**
   * @method renderAddressOptiions
   * @summary renders address options at the bottom of the address book form
   * if no address in addressBook array only show the isCommercial option
   * since a first address will always be the default shipping/billing address.
   * @since 2.0.0
   * @return {Object} - JSX and Checkbox components.
   */
  renderAddressOptions() {
    const { hasAddress } = this.props;
    const { fields } = this.state;
    let defaultOptions;
    if (hasAddress) {
      defaultOptions = (
        <div>
          <div className="form-group">
            <div className="checkbox">
              <Components.Checkbox
                i18nKeyLabel="address.isShippingDefault"
                label="Make this your default shipping address."
                name="isShippingDefault"
                onChange={this.onFieldChange}
                checked={fields.isShippingDefault}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="checkbox">
              <Components.Checkbox
                i18nKeyLabel="address.isBillingDefault"
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
                i18nKeyLabel="address.isCommercial"
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

  /**
   * @method renderButtons
   * @summary renders submit and cancel buttons for address book form
   * if no address in addressBook array don't show the cancel button
   * since the user needs to add a default address.
   * @since 2.0.0
   * @return {Object} - JSX
   */
  renderButtons() {
    const { cancel, hasAddress } = this.props;
    const cancelBtn = (
      <button type="reset" className="btn btn-default" style={{ marginLeft: "5px" }} onClick={cancel}>
        <Components.Translation defaultValue="Cancel" i18nKey="app.cancel" />
      </button>
    );
    return (
      <div className="row text-right">
        <button type="submit" className="btn btn-primary">
          <Components.Translation defaultValue="Save and continue" i18nKey="app.saveAndContinue" />
        </button>
        {(hasAddress) ? cancelBtn : ""}
      </div>
    );
  }

  render() {
    const { countries } = this.props;
    const { regions, fields } = this.state;
    let regionField;
    if (regions.length === 0) {
      // if no region optioins
      // render a TextField
      regionField = (
        <Components.TextField
          i18nKeyLabel="address.region"
          label="Region"
          name="region"
          onChange={this.onFieldChange}
          value={fields.region}
        />
      );
    } else {
      // if region optioins
      // render a Select
      regionField = (
        <Components.Select
          i18nKeyLabel="address.region"
          label="Region"
          name="region"
          options={regions}
          onChange={this.onSelectChange}
          value={fields.region}
        />
      );
    }
    return (
      <form onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-md-6">
            <Components.Select
              i18nKeyLabel="address.country"
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
              i18nKeyLabel="address.fullName"
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
              i18nKeyLabel="address.address1"
              label="Address"
              name="address1"
              onChange={this.onFieldChange}
              value={fields.address1}
            />
          </div>
          <div className="col-md-6">
            <Components.TextField
              i18nKeyLabel="address.address2"
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
              i18nKeyLabel="address.postal"
              label="Postal"
              name="postal"
              onChange={this.onFieldChange}
              value={fields.postal}
            />
          </div>
          <div className="col-md-4">
            <Components.TextField
              i18nKeyLabel="address.city"
              label="City"
              name="city"
              onChange={this.onFieldChange}
              value={fields.city}
            />
          </div>
          <div className="col-md-4">
            {regionField}
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Components.TextField
              i18nKeyLabel="address.phone"
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
