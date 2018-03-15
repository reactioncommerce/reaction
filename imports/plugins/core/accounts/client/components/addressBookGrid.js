import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookGrid extends Component {
  static propTypes = {
    addressBook: PropTypes.array, // array of address objects
    edit: PropTypes.func, // selects an address to be edited and renders the AddressBookForm
    remove: PropTypes.func, // removes the selected address
    select: PropTypes.func // selects a default shipping or billing address
  }

  state = {
    defaultAddress: {
      shipping: this.defaultShippingAddressId, // the _id of the default shipping address
      billing: this.defaultBillingAddressId // the _id of the default billing address
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  get defaultShippingAddressId() {
    const { addressBook } = this.props;
    const defaultShippingAddress = addressBook.find((addy) => addy.isShippingDefault);
    return (defaultShippingAddress) ? defaultShippingAddress._id : "";
  }

  get defaultBillingAddressId() {
    const { addressBook } = this.props;
    const defaultBillingAddress = addressBook.find((addy) => addy.isBillingDefault);
    return (defaultBillingAddress) ? defaultBillingAddress._id : "";
  }

  setDefaultAddress(_id, usage) {
    const { defaultAddress } = this.state;
    defaultAddress[usage] = _id;
    this.setState({ defaultAddress });
  }

  onSelect = (_id, usage) => {
    const { select } = this.props;
    this.setDefaultAddress(_id, usage);
    select(_id, usage);
  }

  /**
   * @method renderHeading
   * @summary renders address book grid heading content
   * @since 2.0.0
   * @return {Object} - JSX
   */
  renderHeading() {
    return (
      <div className="address-list-header">
        <div className="address-list-heading">
          <h4>
            <Components.Translation defaultValue="Select a shipping address" i18nKey="addressBookGrid.selectShippingAddress" />
          </h4>
        </div>
        <div className="address-list-heading">
          <h4>
            <Components.Translation defaultValue="Select a billing address" i18nKey="addressBookGrid.selectBillingAddress"/>
          </h4>
        </div>
        <div className="address-list-heading-blank" />
      </div>
    );
  }

  /**
   * @method renderAddress
   * @summary renders an address
   * @since 2.0.0
   * @param {Object} address - address object that we destructor to get the needed property
   * @return {Object} - JSX
   */
  renderAddress({ address1, address2, city, region, postal, country, phone }) {
    return (
      <address>
        {address1}
        {address2},<br/>
        {city}, {region} {postal} {country}<br/>
        {phone}
      </address>
    );
  }

  /**
   * @method renderAddressGrid
   * @summary renders address grid by mapping over the addressBook array
   * @since 2.0.0
   * @return {Object} - JSX
   */
  renderAddressGrid() {
    const { addressBook, edit, remove } = this.props;
    // TODO: keyboard helper
    return addressBook.map((address) => {
      const { defaultAddress: { shipping, billing } } = this.state;
      const { _id, fullName } = address;
      const activeShipping = (shipping === _id) ? "active" : "";
      const activeBilling = (billing === _id) ? "active" : "";
      return (
        <div className="address-list-item" key={_id}>
          <div className={`address ${activeShipping}`} role="button" tabIndex="0" onClick={() => { this.onSelect(_id, "shipping"); }}>
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div className={`address ${activeBilling}`} role="button" tabIndex="0" onClick={() => { this.onSelect(_id, "billing"); }}>
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div className="controls">
            <button className="btn btn-default" onClick={() => { edit(_id); }}>
              <span className="sr-only">
                <Components.Translation defaultValue="Edit Address" i18nKey="addressBookGrid.edit" />
              </span>
              <i className="fa fa-pencil" />
            </button>
            <button className="btn btn-default danger-action" onClick={() => { remove(_id); }}>
              <span className="sr-only">
                <Components.Translation defaultValue="Remove Address" i18nKey="addressBookGrid.removeAddress" />
              </span>
              <i className="fa fa-trash-o" />
            </button>
          </div>
        </div>
      );
    });
  }

  render() {
    console.log("address book grid", this.defaultShippingAddressId, this.state)
    return (
      <div className="address-list">
        {this.renderHeading()}
        {this.renderAddressGrid()}
      </div>
    );
  }
}

registerComponent("AddressBookGrid", AddressBookGrid);

export default AddressBookGrid;
