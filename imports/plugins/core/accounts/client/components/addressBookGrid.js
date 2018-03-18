import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookGrid extends Component {
  static propTypes = {
    /**
     * array of address objects
     */
    addressBook: PropTypes.arrayOf(PropTypes.shape({
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
    })),
    /**
     * selects an address to be edited and renders the AddressBookForm
     */
    edit: PropTypes.func,
    /**
     * removes the selected address
     */
    remove: PropTypes.func,
    /**
     * selects a default shipping or billing address
     */
    select: PropTypes.func
  }

  state = {
    defaultShippingAddressId: this.defaultShippingAddressId,
    defaultBillingAddressId: this.defaultBillingAddressId
  }

  componentWillReceiveProps(nextProps) {
    let { addressBook } = nextProps;
    if (!Array.isArray(addressBook)) addressBook = [];
    // if a new address has been added to the addressBook
    // check to see if the new address is now the default shipping or billing address
    addressBook.forEach((addy) => {
      if (addy.isShippingDefault && addy._id !== this.defaultShippingAddressId) {
        this.setDefaultAddress(addy._id, "shipping");
      }

      if (addy.isBillingDefault && addy._id !== this.defaultBillingAddressId) {
        this.setDefaultAddress(addy._id, "billing");
      }
    });
  }

  // Address Book Grid helpers

  /**
   * @method setDefaultaddress
   * @summary updating the compoenet state with the new default shipping or billing address.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @param {String} usage - the address usage "shipping" or "billing".
   */
  setDefaultAddress(_id, usage) {
    let { defaultBillingAddressId, defaultShippingAddressId } = this.state;
    if (usage === "shipping") defaultShippingAddressId = _id;
    if (usage === "billing") defaultBillingAddressId = _id;
    this.setState({ defaultBillingAddressId, defaultShippingAddressId });
  }

  /**
   * @method defaultShippingAddressId
   * @summary getter that returns ether the default shipping address _id or and empty string.
   * @since 2.0.0
   * @return {String} - default shipping address _id or empty string.
   */
  get defaultShippingAddressId() {
    const { addressBook } = this.props;
    const defaultShippingAddress = addressBook.find((addy) => addy.isShippingDefault);
    return (defaultShippingAddress) ? defaultShippingAddress._id : "";
  }

  /**
   * @method defaultBillingAddressId
   * @summary getter that returns ether the default billing address _id or and empty string.
   * @since 2.0.0
   * @return {String} - default billing address _id or empty string.
   */
  get defaultBillingAddressId() {
    const { addressBook } = this.props;
    const defaultBillingAddress = addressBook.find((addy) => addy.isBillingDefault);
    return (defaultBillingAddress) ? defaultBillingAddress._id : "";
  }

  // Address Book Actions

  /**
   * @method onSelect
   * @summary handler when an address in the grid is selected as
   * a default shipping or billing address. This handler sets the default address
   * in component state as well as calling the parent reducer to set the default address in db.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @param {String} usage - the address usage "shipping" or "billing".
   */
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
    return addressBook.map((address) => {
      const { defaultBillingAddressId, defaultShippingAddressId } = this.state;
      const { _id, fullName } = address;
      const activeShipping = (defaultShippingAddressId === _id) ? "active" : "";
      const activeBilling = (defaultBillingAddressId === _id) ? "active" : "";
      return (
        <div className="address-list-item" key={_id}>
          <div
            className={`address ${activeShipping}`}
            role="button"
            tabIndex="0"
            onKeyUp={(e) => { if (e.keyCode === 13) this.onSelect(_id, "shipping"); }}
            onClick={() => { this.onSelect(_id, "shipping"); }}
          >
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div
            className={`address ${activeBilling}`}
            role="button"
            tabIndex="0"
            onKeyUp={(e) => { if (e.keyCode === 13) this.onSelect(_id, "billing"); }}
            onClick={() => { this.onSelect(_id, "billing"); }}
          >
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
