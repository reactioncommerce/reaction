import React, { Component } from "react";
import PropTypes from "prop-types";
import { isObject, transform, isEqual } from "lodash";
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
     * country options for select
     */
    countries: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.String,
      value: PropTypes.String
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
     * handles error by calling Alerts.toast with the error meesage
     */
    onError: PropTypes.func,
    /**
     * regions by county
     */
    regionsByCountry: PropTypes.Object,
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
    updateAddress() {},
    onError() {}
  }

  constructor(props) {
    super(props);

    console.log("***************** AddressBook is made again ******************");

    this.state = {
      /**
       * No address, enable the form
       */
      mode: (!props.addressBook || props.addressBook.length === 0) ? "entry" : "grid",
      /**
       * Address to be edited
       */
      editAddress: {},
      /**
       * Address returned after validation check
       */
      validationResults: null
    };
  }


  componentWillReceiveProps(nextProps) {
    let { addressBook } = nextProps;
    const { mode } = this.state;
    if (!Array.isArray(addressBook)) addressBook = [];

    if (mode === "review") {
      return;
    }

    // if the new addressBook array is empty and
    // the address book form is not active
    if (addressBook.length === 0 && mode !== "entry") {
      this.mode = "entry";
    }

    // if the new addressBook array is not empty but
    // the address book form is active
    if (addressBook.length !== 0 && mode !== "grid") {
      this.mode = "grid";
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const d = this.difference(nextProps, this.props);
    console.log("Props difference", d);
    const d2 = this.difference(nextState, this.state);
    console.log("State difference", d2);
  }

  /**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
  difference(object, base) {
    function changes(object, base) {
      return transform(object, (result, value, key) => {
        if (!isEqual(value, base[key])) {
          result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }
    return changes(object, base);
  }

  set mode(mode) {
    this.setState({
      mode
    });
  }

  setEntryMode = () => {
    this.setState({
      mode: "entry"
    });
  }

  switchMode = (newMode, address) => {
    this.setState({
      mode: newMode,
      editAddress: address
    });
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
   */
  onAdd = (address, validateAddress = true) => {
    const { addAddress, onError, updateAddress } = this.props;
    // if edit address is in the address book form
    if (this.hasEditAddress) {
      const { editAddress } = this.state;
      // new object with editAddress _id and the param addess data
      this.clearForm();
      return updateAddress({ _id: editAddress._id, ...address }).catch(onError);
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
      })
      .catch(onError);
  }

  // Address Book Actions

  /**
   * @method onCancel
   * @summary sets mode to "grid" and clears the address book form.
   * this will only be called from the address book form.
   * @since 2.0.0
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
   */
  renderContent() {
    console.log("Rendering", this.state.mode);
    const { addressBook } = this;
    const { countries, regionsByCountry } = this.props;
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
