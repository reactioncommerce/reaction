import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookGrid extends Component {
  static propTypes = {
    addressBook: PropTypes.array
  }

  // render the address book grid heading
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
    const { addressBook } = this.props;
    return addressBook.map((address) => {
      const { fullName, _id } = address;
      return (
        <div className="address-list-item" key={_id}>
          <div className="address">
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div className="address">
            <strong>{fullName}</strong>
            {this.renderAddress(address)}
          </div>
          <div className="controls">
            <button type="button" className="btn btn-default" data-id="{{_id}}" data-event-action="editAddress" title="{{i18n 'addressBookGrid.edit' 'Edit'}}">
              <i className="fa fa-pencil"></i>
            </button>
            <button type="button" className="btn btn-default danger-action" data-id="{{_id}}" data-event-action="removeAddress" title="{{i18n 'addressBookGrid.removeAddress' 'Remove Address'}}">
              <i className="fa fa-trash-o"></i>
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
