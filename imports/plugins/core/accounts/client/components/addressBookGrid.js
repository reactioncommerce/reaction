import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookGrid extends Component {
  static propTypes = {
    // array of address objects
    addressBook: PropTypes.arrayOf(PropTypes.shape({
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
    })),
    // selects an address to be edited and renders the AddressBookForm
    edit: PropTypes.func,
    // removes the selected address
    remove: PropTypes.func,
    // selects a default shipping or billing address
    select: PropTypes.func
  }

  static defaultProps = {
    edit() {},
    remove() {},
    select() {}
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
   * @ignore
   */
  setDefaultAddress(_id, usage) {
    if (usage === "shipping") {
      this.setState({
        defaultShippingAddressId: _id
      });
    }
    if (usage === "billing") {
      this.setState({
        defaultBillingAddressId: _id
      });
    }
  }

  /**
   * @method addressBook
   * @summary getter that returns the addressBook array if avalible on the props or an empty array.
   * @since 2.0.0
   * @return {Array} addressBook - array of address object or an empty array.
   * @ignore
   */
  get addressBook() {
    let { addressBook } = this.props;
    if (!Array.isArray(addressBook)) addressBook = [];
    return addressBook;
  }

  /**
   * @method defaultShippingAddressId
   * @summary getter that returns ether the default shipping address _id or and empty string.
   * @since 2.0.0
   * @return {String} - default shipping address _id or empty string.
   * @ignore
   */
  get defaultShippingAddressId() {
    const { addressBook } = this;
    const defaultShippingAddress = addressBook.find((addy) => addy.isShippingDefault);
    return (defaultShippingAddress) ? defaultShippingAddress._id : "";
  }

  /**
   * @method defaultBillingAddressId
   * @summary getter that returns ether the default billing address _id or and empty string.
   * @since 2.0.0
   * @return {String} - default billing address _id or empty string.
   * @ignore
   */
  get defaultBillingAddressId() {
    const { addressBook } = this;
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
   * @ignore
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
   * @ignore
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
   * @ignore
   */
  renderAddress({ address1, address2, city, region, postal, country, phone }) {
    return (
      <address>
        {`${address1 || ""} ${address2 || ""}`.trim()}<br/>
        {city}, {region} {postal} {country}<br/>
        {phone || ""}
      </address>
    );
  }

  /**
   * @method renderAddressGrid
   * @summary renders address grid by mapping over the addressBook array
   * @since 2.0.0
   * @return {Object} - JSX
   * @ignore
   */
  renderAddressGrid() {
    const { addressBook } = this;
    const { edit, remove } = this.props;
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
          {/* <span className="sr-only"> */}
          <div className="controls">
            <Components.Button
              className="btn btn-default"
              onClick={() => { edit(_id); }}
              icon="fa fa-pencil"
              tooltip="Edit Address"
              i18nKeyTooltip="addressBookGrid.edit"
            />
            <Components.Button
              className="btn btn-default danger-action"
              onClick={() => { remove(_id); }}
              icon="fa fa-trash-o"
              tooltip="Remove Address"
              i18nKeyTooltip="addressBookGrid.removeAddress"
            />
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
