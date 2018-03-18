import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBook extends Component {
  static propTypes = {
    /**
     * Add address reducer calls meteor method
     */
    addAddress: PropTypes.func,
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
     *  Heading content for address book
     */
    heading: PropTypes.shape({
      /**
       * Heading title
       */
      defaultValue: PropTypes.String,
      /**
       * i18nKey for heading title
       */
      i18nKey: PropTypes.String,
      /**
       * If in checkout view, addressbook checkout step position and icon className
       */
      checkout: PropTypes.shape({
        icon: PropTypes.String,
        position: PropTypes.Number
      })
    }),
    /**
     * Remove address reducer calls meteor method
     */
    removeAddress: PropTypes.func,
    /**
     * Update address reducer calls meteor method
     */
    updateAddress: PropTypes.func
  }

  static defaultProps = {
    addAddress() {},
    removeAddress() {},
    updateAddress() {}
  }

  state = {
    /**
     * No address, enable the form
     */
    entryMode: (!this.props.addressBook || this.props.addressBook.length === 0),
    /**
     * Address to be edited
     */
    editAddress: {}
  }

  componentWillReceiveProps(nextProps) {
    let { addressBook } = nextProps;
    const { entryMode } = this.state;
    if (!Array.isArray(addressBook)) addressBook = [];

    // if the new addressBook array is empty and
    // the address book form is not active
    if (addressBook.length === 0 && !entryMode) {
      this.toggleEntryMode();
    }

    // if the new addressBook array is not empty but
    // the address book form is active
    if (addressBook.length !== 0 && entryMode) {
      this.toggleEntryMode();
    }
  }

  // Address Book helpers

  /**
   * @method findAddress
   * @summary using the provided _id finds an address object from the addressBook array.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @return {Object} - address object.
   */
  findAddress(_id) {
    const { addressBook } = this;
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
   * @method addressBook
   * @summary getter that returns the addressBook array if avalible on the props or an empty array.
   * @since 2.0.0
   * @return {Array} addressBook - array of address object or an empty array.
   */
  get addressBook() {
    let { addressBook } = this.props;
    if (!Array.isArray(addressBook)) addressBook = [];
    return addressBook;
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
    const { addressBook } = this;
    return (addressBook && addressBook.length !== 0);
  }

  // Address Actions

  /**
   * @method onSelect
   * @summary updating an address if it's been selected as the default shipping or billing address.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @param {String} usage - the address usage "shipping" or "billing".
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
      let translationContent;
      if (this.hasAddress) {
        // has address in addressBook array, adding a new entry
        translationContent = { defaultValue: "Add a new address entry", i18nKey: "addressBookAdd.addAddress" };
      } else {
        // first address to be created is default address
        translationContent = { defaultValue: "Create your default address", i18nKey: "addressBookAdd.createAddress" };
      }

      controlBarContent = (
        <Components.Translation {...translationContent} />
      );
    } else if (entryMode && this.hasEditAddress) {
      // active form with an edit address
      // show editing address message
      controlBarContent = (
        <Components.Translation defaultValue="Editing this address entry" i18nKey="addressBookEdit.editAddress" />
      );
    } else {
      controlBarContent = (
        <button className="btn btn-default" onClick={this.toggleEntryMode}>
          <i className="fa fa-plus fa-lg address-icons" />
          <Components.Translation defaultValue="Add Address" i18nKey="addressBookGrid.addAddress"/>
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
    const { addressBook } = this;
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
