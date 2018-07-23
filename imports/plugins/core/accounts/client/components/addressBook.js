import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBook extends Component {
  static propTypes = {
    // Add address reducer calls meteor method
    addAddress: PropTypes.func,
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
    // country options for select
    countries: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })),
    //  Heading content for address book
    heading: PropTypes.shape({
      // Heading title
      defaultValue: PropTypes.string,
      // i18nKey for heading title
      i18nKey: PropTypes.string,
      // If in checkout view, addressbook checkout step position and icon className
      checkout: PropTypes.shape({
        icon: PropTypes.string,
        position: PropTypes.Number
      })
    }),
    // the initial mode of the AddressBook(used only in constructor)
    initMode: PropTypes.oneOf(["grid", "entry", "review"]),
    // function to mark tax calculation on cart.
    markCart: PropTypes.func,
    // handles error by calling Alerts.toast with the error meesage
    onError: PropTypes.func,
    // regions by county
    regionsByCountry: PropTypes.object,
    // Remove address reducer calls meteor method
    removeAddress: PropTypes.func,
    // Update address reducer calls meteor method
    updateAddress: PropTypes.func
  }

  static defaultProps = {
    addAddress() {},
    removeAddress() {},
    updateAddress() {},
    onError() {}
  }

  constructor(props) {
    super(props);

    let mode = (!props.addressBook || props.addressBook.length === 0) ? "entry" : "grid";
    // initMode overrired everything
    if (props.initMode) {
      mode = props.initMode;
    }

    this.state = {
      // No address, enable the form
      mode,
      // Address to be edited
      editAddress: {},
      // Address returned after validation check
      validationResults: null
    };
  }


  componentWillReceiveProps(nextProps) {
    let { addressBook } = nextProps;
    let { mode } = this.state;
    if (!Array.isArray(addressBook)) addressBook = [];

    if (mode === "review") {
      return;
    }

    // if the new addressBook array is empty and
    // the address book form is not active
    if (addressBook.length === 0) {
      mode = "entry";
    }

    if (!this.props.initMode && nextProps.initMode) {
      mode = nextProps.initMode;
    }

    this.mode = mode;
  }

  // State change helpers

  /**
   * @method mode
   * @summary setter for mode in state
   * @since 2.0.0
   * @param {String} mode - the mode to be set.
   * @ignore
   */
  set mode(mode) {
    this.setState({
      mode
    });
  }

  /**
   * @method setEntryMode
   * @summary changes the mode to "entry"
   * @since 2.0.0
   * @ignore
   */
  setEntryMode = () => {
    this.mode = "entry";
  }

  /**
   * @method switchMode
   * @summary changes the address to newMode and editAddress to the value passed.
   * @since 2.0.0
   * @param {String} newMode - new mode to be set
   * @param {String} editAddress - the address to be set for the form.
   * @return {Object} - address object.
   * @ignore
   */
  switchMode = (newMode, editAddress) => {
    this.setState({
      mode: newMode,
      editAddress
    });
  }

  // Address Book helpers

  /**
   * @method findAddress
   * @summary using the provided _id finds an address object from the addressBook array.
   * @since 2.0.0
   * @param {String} _id - address object _id.
   * @return {Object} - address object.
   * @ignore
   */
  findAddress(_id) {
    const { addressBook } = this;
    return addressBook.find((addy) => addy._id === _id);
  }

  /**
   * @method clearForm
   * @summary removes the editAddress from state this will clear the address book form.
   * @since 2.0.0
   * @ignore
   */
  clearForm() {
    if (this.hasEditAddress) this.setState({ editAddress: {} });
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
   * @method hasEditaddress
   * @summary getter that returns true if there is an editAddress in state.
   * @since 2.0.0
   * @return {Boolean}
   * @ignore
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
   * @ignore
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
   * @ignore
   */
  onSelect = (_id, usage) => {
    const { onError, updateAddress } = this.props;
    const address = this.findAddress(_id);
    switch (usage) {
      case "shipping":
        updateAddress(address, "isShippingDefault").catch(onError);
        break;
      case "billing":
        updateAddress(address, "isBillingDefault").catch(onError);
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
   * @ignore
   */
  onRemove = (_id) => {
    const { onError, removeAddress } = this.props;
    removeAddress(_id).catch(onError);
  }

  /**
   * @method onAdd
   * @summary adds or updates an address in the addressBook.
   * @since 2.0.0
   * @param {Object} address - new or updated address object.
   * @ignore
   */
  onAdd = (address, validateAddress = true) => {
    const { addAddress, onError, updateAddress } = this.props;
    // if edit address is in the address book form
    if (this.hasEditAddress || address._id) {
      const { editAddress } = this.state;
      // new object with editAddress _id and the param addess data
      this.clearForm();
      return updateAddress({ _id: editAddress._id, ...address }, null, validateAddress)
        .then((result) => {
          if (result && result.validated === false) {
            this.setState({
              mode: "review",
              validationResults: result
            });
          } else {
            this.setState({
              mode: "grid"
            });
          }
          return undefined;
        })
        .catch(onError);
    }
    return addAddress(address, validateAddress)
      .then((result) => {
        if (result && result.validated === false) {
          this.setState({
            mode: "review",
            validationResults: result
          });
        } else {
          this.setState({
            mode: "grid"
          });
        }
        return undefined;
      })
      .catch(onError);
  }

  // Address Book Actions

  /**
   * @method onCancel
   * @summary sets mode to "grid" and clears the address book form.
   * this will only be called from the address book form.
   * @since 2.0.0
   * @ignore
   */
  onCancel = () => {
    this.mode = "grid";
    this.clearForm();
  }

  /**
   * @method onEdit
   * @summary sets the address to be edited and makes the mode as "entry".
   * this will only be called form the address book grid.
   * @since 2.0.0
   * @ignore
   */
  onEdit = (_id) => {
    const editAddress = this.findAddress(_id);
    this.setState({ editAddress });
    this.mode = "entry";
  }

  // Address Book JSX

  /**
   * @method renderCheckoutIcon
   * @summary renders address book heading checkout step icon when
   * the address book is being called from checkout
   * @since 2.0.0
   * @return {Object} - JSX
   * @ignore
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
   * @ignore
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
   * @ignore
   */
  renderControlBar() {
    const { mode } = this.state;

    let controlBarContent;
    if (mode === "entry" && !this.hasEditAddress) {
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
    } else if (mode === "entry" && this.hasEditAddress) {
      // active form with an edit address
      // show editing address message
      controlBarContent = (
        <Components.Translation defaultValue="Editing this address entry" i18nKey="addressBookEdit.editAddress" />
      );
    } else if (mode === "grid") {
      controlBarContent = (
        <button className="btn btn-default" onClick={this.setEntryMode}>
          <i className="fa fa-plus fa-lg address-icons" />
          <Components.Translation defaultValue="Add Address" i18nKey="addressBookGrid.addAddress"/>
        </button>
      );
    } else if (mode === "review") {
      controlBarContent = (
        <Components.Translation defaultValue="Review address" i18nKey="addressBookEdit.reviewAddress" />
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
   * @summary renders the AddressBookForm, AddressBookGrid, AddressBookReview components
   * based on mode.
   * @since 2.0.0
   * @return {Object} - JSX and child component.
   * @ignore
   */
  renderContent() {
    const { addressBook } = this;
    const { countries, regionsByCountry, markCart } = this.props;
    const { editAddress, mode } = this.state;

    let content;
    if (mode === "entry") {
      content = (
        <Components.AddressBookForm
          add={this.onAdd}
          cancel={this.onCancel}
          countries={countries}
          editAddress={editAddress}
          hasAddress={this.hasAddress}
          regionsByCountry={regionsByCountry}
        />
      );
    } else if (mode === "grid") {
      content = (
        <Components.AddressBookGrid
          addressBook={addressBook}
          edit={this.onEdit}
          remove={this.onRemove}
          select={this.onSelect}
        />
      );
    } else {
      content = (
        <Components.AddressBookReview
          addressBook={addressBook}
          add={this.onAdd}
          validationResults={this.state.validationResults}
          switchMode={this.switchMode}
          markCart={markCart}
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
