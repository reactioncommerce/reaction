import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBook extends Component {
  static propTypes = {

  }


  // rendering the address book heading
  // this content will change based on where
  // in the app this component is being used
  renderHeading() {
    return (
      <div className="panel-heading">
        <h2 className="panel-title" data-i18n="accountsUI.addressBook">Address Book</h2>
        <h2 className="panel-title">
          <Components.Translation defaultValue="Address Book" i18nKey="accountsUI.addressBook" />
        </h2>
      </div>
    );
  }

  render() {
    return (
      <div className="panel panel-default panel-address-book">
        {this.renderHeading()}
        <div className="address-book">
          Address Book!
        </div>
      </div>
    );
  }
}

registerComponent("AddressBook", AddressBook);

export default AddressBook;
