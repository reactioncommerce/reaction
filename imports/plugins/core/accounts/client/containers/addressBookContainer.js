import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBook extends Component {
  static propTypes = {
    account: PropTypes.object, // might only need the accountId
    addAddress: PropTypes.func, // add address reducer calls meteor method
    addressBook: PropTypes.array, // array of address objects
    heading: PropTypes.object, // heading content { defaultValue: String, i18nKey: String, checkout: Object }
    removeAddress: PropTypes.func, // remove address reducer calls meteor method
    updateAddress: PropTypes.func // update address reducer calls meteor method
  }

  state = {
    entryMode: (!this.props.addressBook || this.props.addressBook.length === 0), // no address, enable the form
    editAddress: {} // address to be edited.
  }

  componentWillReceiveProps(nextProps) {
    const { entryMode } = this.state;

    // if the new addressBook array is empty and
    // the address book form is not active
    if (!this.hasAddress && !entryMode) {
      this.toggleEntryMode();
    }

    // if the new addressBook array is not empty but
    // the address book form is active
    if (this.hasAddress && entryMode) {
      this.toggleEntryMode();
    }
  }

  // Address Book helpers

  /**
   * @method findAddres
   * @summary using the provided _id finds an address object from the addressBook array.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @return {Object} - address object.
   */
  findAddress(_id) {
    const { addressBook } = this.props;
    return addressBook.find((addy) => addy._id === _id);
  }

  /**
   * @method clearForm
   * @summary removes the editAddress from state this will clear the address book form.
   * @since 2.0.0
   */
  clearForm() {
    if (this.hasEditAddress) this.setState({ editAddress: {} });
  }

  /**
   * @method hasEditaddress
   * @summary getter that returns true if there is an editAddress in state.
   * @since 2.0.0
   * @return {Boolean}
   */
  get hasEditAddress() {
    const { editAddress } = this.state;
    return (Object.keys(editAddress).length !== 0);
  }

  /**
   * @method hasAddress
   * @summary getter that returns true if there is at least 1 address in the addressBook array.
   * @since 2.0.0
   * @return {Boolean}
   */
  get hasAddress() {
    const { addressBook } = this.props;
    return (addressBook && addressBook.length !== 0);
  }

  // Address Actions

  /**
   * @method onSelect
   * @summary updating an address if it's been selected as the default shipping or billing address.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @param {String} usage - the address usage "shipping" or "billing".
   * @return {Object} - contains the component for updating a user's address.
   */
  onSelect = (_id, usage) => {
    const { updateAddress } = this.props;
    const address = this.findAddress(_id);
    switch (usage) {
      case "shipping":
        updateAddress(address, "isShippingDefault");
        break;
      case "billing":
        updateAddress(address, "isBillingDefault");
        break;
      default:
        return;
    }
  }

  /**
   * @method onRemove
   * @summary using the provided _id to call the removeAddress reducer that removes an address.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   */
  onRemove = (_id) => {
    const { removeAddress } = this.props;
    removeAddress(_id);
  }

  /**
   * @method onAdd
   * @summary adds or updates an address in the addressBook.
   * @since 2.0.0
   * @param {Object} address - new or updated address object.
   */
  onAdd = (address) => {
    const { addAddress, updateAddress } = this.props;

    // if edit address is in the address book form
    if (this.hasEditAddress) {
      const { editAddress } = this.state;
      // new object with editAddress _id and the param addess data
      updateAddress({ _id: editAddress._id, ...address });
      this.clearForm();
    } else {
      addAddress(address);
    }
  }

  // Address Book Actions

  /**
   * @method toggleEntryMode
   * @summary toggles the entryMode state.
   * @since 2.0.0
   */
  toggleEntryMode = () => {
    const { entryMode } = this.state;
    this.setState({ entryMode: !entryMode });
  }

  /**
   * @method onCancel
   * @summary toggles the entryMode state and clears the address book form.
   * this will only be called from the address book form.
   * @since 2.0.0
   */
  onCancel = () => {
    this.toggleEntryMode();
    this.clearForm();
  }

  /**
   * @method onEdit
   * @summary sets the address to be edited and toggles the entryMode state.
   * this will only be called form the address book grid.
   * @since 2.0.0
   */
  onEdit = (_id) => {
    const editAddress = this.findAddress(_id);
    this.setState({ editAddress });
    this.toggleEntryMode();
  }

  // Address Book JSX

  /**
   * @method renderCheckoutIcon
   * @summary renders address book heading checkout step icon when
   * the address book is being called from checkout
   * @since 2.0.0
   * @return {Object} - JSX
   */
  renderCheckoutIcon() {
    const { checkout: { icon, position } } = this.props.heading;
    return <i className={`checkout-step-badge ${icon}`} >{position}</i>;
  }

  /**
   * @method renderHeading
   * @summary renders address book heading content, this content will change
   * based on where in the app this component is being used
   * @since 2.0.0
   * @return {Object} - JSX
   */
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

  /**
   * @method renderControlBar
   * @summary renders adding or editing address message if the form is showing
   * renders an add address button if the grid is showiing.
   * @since 2.0.0
   * @return {Object} - JSX
   */
  renderControlBar() {
    const { entryMode } = this.state;

    let controlBarContent;
    if (entryMode && !this.hasEditAddress) {
      // active form with no edit address
      // show adding address message
      controlBarContent = (
        <span>Add a new address entry</span>
      );
    } else if (entryMode && this.hasEditAddress) {
      // active form with an edit address
      // show editing address message
      controlBarContent = (
        <span>Editing this addres entry</span>
      );
    } else {
      controlBarContent = (
        <button className="btn btn-default" onClick={this.toggleEntryMode}>
          <i className="fa fa-plus fa-lg address-icons" />
          <span data-i18n="addressBookGrid.addAddress">Add Address</span>
        </button>
      );
    }

    return (
      <div className="panel-control-bar">
        {controlBarContent}
      </div>
    );
  }

  /**
   * @method renderContent
   * @summary renders ether the AddressBookForm or AddressBookGrid components
   * if the entryMode is active or not.
   * @since 2.0.0
   * @return {Object} - JSX and child component.
   */
  renderContent() {
    const { addressBook } = this.props;
    const { editAddress, entryMode } = this.state;

    let content;
    if (entryMode) {
      content = (
        <Components.AddressBookForm
          add={this.onAdd}
          cancel={this.onCancel}
          editAddress={editAddress}
          hasAddress={this.hasAddress}
        />
      );
    } else {
      content = (
        <Components.AddressBookGrid
          addressBook={addressBook}
          edit={this.onEdit}
          remove={this.onRemove}
          select={this.onSelect}
        />
      );
    }

    return (
      <div className="panel-body panel-content">
        {content}
      </div>
    );
  }

  render() {
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
