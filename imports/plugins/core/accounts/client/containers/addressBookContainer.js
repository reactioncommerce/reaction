import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBook extends Component {
  static propTypes = {
    account: PropTypes.object, // might only need the accountId
    addressBook: PropTypes.array,
    heading: PropTypes.object // { defaultValue: String, i18nKey: String, checkout: Object }
  }

  state = {
    entryMode: false
  }

  // rendering the checkout step icon
  renderCheckoutIcon() {
    const { checkout: { icon, position } } = this.props.heading;
    return <i className={`checkout-step-badge ${icon}`} >{position}</i>;
  }

  // rendering the address book heading
  // this content will change based on where
  // in the app this component is being used
  renderHeading() {
    const { heading } = this.props;
    return (
      <div className="panel-heading">
        {heading.checkout ? this.renderCheckoutIcon() : ""}
        <h2 className="panel-title">
          <Components.Translation {...heading} />
        </h2>
      </div>
    );
  }

  renderControlBar() {
    const { entryMode } = this.state;
    return (
      <div className="panel-control-bar">
        {(entryMode) ? "Adding New Address" : "Add Address"}
      </div>
    );
  }

  // render address book content
  renderContent() {
    const { addressBook } = this.props;
    const { entryMode } = this.state;
    return (
      <div className="panel-body panel-content">
        {(entryMode) ? <Components.AddressBookForm /> : <Components.AddressBookGrid addressBook={addressBook} />}
      </div>
    );
  }

  render() {
    console.log("React AddressBookContainer", this.props, this.state);
    return (
      <div className="panel panel-default panel-address-book">
        {this.renderHeading()}
        <div className="address-book">
          {this.renderControlBar()}
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

registerComponent("AddressBook", AddressBook);

export default AddressBook;
