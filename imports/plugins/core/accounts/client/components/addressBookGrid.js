import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookGrid extends Component {

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

  renderAddress() {
    const { fullName, address1, address2, city, region, postal, country, phone } = this.props;
    return (
      <div className="address selectedShipping">
        <strong>{fullName}</strong>
        <address>
          {address1}
          {address2},<br/>
          {city}, {region} {postal} {country}<br/>
          {phone}
        </address>
      </div>
    );
  }

  renderAddressGrid() {
    return (
      <div className="address-list-item">
        <div className="address active" data-event-action="selectBillingAddress">
          address! yay
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


// {{#each addressBook}}
//   <div className="address-list-item">
//   <div className="address {{selectedShipping}}" data-event-action="selectShippingAddress">
//   <strong>{{fullName}}</strong>
//   <address>
//   {{address1}}
// {{address2}},<br>
//   {{city}}, {{region}} {{postal}} {{country}}<br>
//   {{phone}}
// </address>
//   </div>
//   <div className="address {{selectedBilling}}" data-event-action="selectBillingAddress">
//   <strong>{{fullName}}</strong>
//   <address>
//   {{address1}}
// {{address2}},<br>
//   {{city}}, {{region}} {{postal}} {{country}}<br>
//   {{phone}}
// </address>
//   </div>
//   <div className="controls">
//   <button type="button" className="btn btn-default" data-id="{{_id}}" data-event-action="editAddress" title="{{i18n 'addressBookGrid.edit' 'Edit'}}">
//   <i className="fa fa-pencil"></i>
//   </button>
//   <button type="button" className="btn btn-default danger-action" data-id="{{_id}}" data-event-action="removeAddress" title="{{i18n 'addressBookGrid.removeAddress' 'Remove Address'}}">
//   <i className="fa fa-trash-o"></i>
//   </button>
//   </div>
//   </div>
//   {{/each}}
