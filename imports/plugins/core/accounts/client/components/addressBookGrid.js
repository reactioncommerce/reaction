import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookGrid extends Component {
  static propTypes = {
    addressBook: PropTypes.array,
    edit: PropTypes.func,
    remove: PropTypes.func,
    select: PropTypes.func
  }

  onSelect = () => {

  }

  // render the address book grid heading
  // TODO: replace h4 copy with translation component
  renderHeading() {
    return (
      <div className="address-list-header">
        <div className="address-list-heading">
          <h4 data-i18n="addressBookGrid.selectShippingAddress">Select a shipping address</h4>
        </div>
        <div className="address-list-heading">
          <h4 id="billing-address-label" data-i18n="addressBookGrid.selectBillingAddress">Select a billing address</h4>
        </div>
        <div className="address-list-heading-blank" />
      </div>
    );
  }

  // rendering individual address
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

  renderAddressGrid() {
    const { addressBook, edit, select, remove } = this.props;
    return addressBook.map((address) => {
      const { _id, fullName, isBillingDefault, isShippingDefault } = address;
      return (
        <div className="address-list-item" key={_id}>
          <div className={`address ${isShippingDefault ? "active" : ""}`} onClick={() => { select(_id, "shipping"); }}>
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div className={`address ${isBillingDefault ? "active" : ""}`} onClick={() => { select(_id, "billing"); }}>
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div className="controls">
            <button className="btn btn-default" title="{{i18n 'addressBookGrid.edit' 'Edit'}}" onClick={() => { edit(_id); }}>
              <i className="fa fa-pencil" />
            </button>
            <button className="btn btn-default danger-action" title="{{i18n 'addressBookGrid.removeAddress' 'Remove Address'}}" onClick={() => { remove(_id); }}>
              <i className="fa fa-trash-o" />
            </button>
          </div>
        </div>
      );
    });
  }

  render() {
    console.log("React AddressBookGrid", this.props, this.state);
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
