import React, { Component } from "react";
import PropTypes from "prop-types";
import { HTTP } from "meteor/http";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookForm extends Component {
  static propTypes = {
    /**
     * add addess callback
     * @ignore
     */
    add: PropTypes.func,
    /**
     * cancel address entry and render AddressBookGrid
     * @ignore
     */
    cancel: PropTypes.func,
    /**
     * country options for select
     * @ignore
     */
    countries: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })),
    /**
     * address object
     * @ignore
     */
    editAddress: PropTypes.object,
    /**
     * has address in addressBook
     * @ignore
     */
    hasAddress: PropTypes.bool,
    /**
     * regions by county
     * @ignore
     */
    regionsByCountry: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      regions: [],
      fields: {
        _id: this.props.editAddress._id,
        country: this.props.editAddress.country || "US", // defaults to United States
        fullName: this.props.editAddress.fullName || "",
        address1: this.props.editAddress.address1 || "",
        address2: this.props.editAddress.address2 || "",
        postal: this.props.editAddress.postal || "",
        city: this.props.editAddress.city || "",
        region: this.props.editAddress.region || "",
        phone: this.props.editAddress.phone || "",
        isShippingDefault: this.props.editAddress.isShippingDefault || (!this.props.hasAddress), // no address, default to true
        isBillingDefault: this.props.editAddress.isBillingDefault || (!this.props.hasAddress), // no addres, default to true
        isCommercial: this.props.editAddress.isCommercial || false
      }
    };
    // Getting the user's countrt and setting it as default
    HTTP.get("https://geo.getreaction.io/json/", (err, res) => {
      if (!err) {
        const countryCode = res.data.country_code;
        if (countryCode && !this.props.editAddress.country) {
          this.setState((prevState) => ({
            fields: {
              ...prevState.fields,
              country: countryCode
            }
          }), () => {
            this.setRegionOptions(countryCode);
          });
        }
      }
    });
  }

  componentWillMount() {
    const { fields: { country } } = this.state;

    // if selected country has region options set those too
    this.setRegionOptions(country);
  }
  // Address Book Form helpers

  fieldLabelMap = {
    region: {
      label: "Region",
      i18nKeyLabel: "address.region"
    },
    country: {
      label: "Country",
      i18nKeyLabel: "address.country"
    },
    fullName: {
      label: "Full Name",
      i18nKeyLabel: "address.fullName"
    },
    address1: {
      label: "Address",
      i18nKeyLabel: "address.address1"
    },
    address2: {
      label: "Address",
      i18nKeyLabel: "address.address2"
    },
    postal: {
      label: "Postal",
      i18nKeyLabel: "address.postal"
    },
    city: {
      label: "City",
      i18nKeyLabel: "address.city"
    },
    phone: {
      label: "Phone",
      i18nKeyLabel: "address.phone"
    }
  }


  /**
   * @method setRegionOptions
   * @summary creates an array of region options for the regions select field.
   * @since 2.0.0
   * @param {String} country - country code "US" "CA" "JP"
   * @ignore
   */
  setRegionOptions(country) {
    const { regionsByCountry, editAddress } = this.props;
    const { fields } = this.state;
    const regions = regionsByCountry[country];

    // if the region field is empty
    if (Object.keys(editAddress).length) {
      this.setState({ regions });
    } else {
      // setting the fields region to be the
      // first region in options array
      const [firstRegion] = regions;
      if (firstRegion !== null && typeof firstRegion === "object") {
        fields.region = firstRegion.value;
      } else {
        fields.region = firstRegion;
      }
      this.setState({ regions, fields });
    }
  }

  clientValidation = (enteredAddress) => {
    const requiredFields = ["country", "fullName", "address1", "postal", "city", "region", "phone"];
    const validation = { messages: {} };
    let isValid = true;
    Object.keys(enteredAddress).forEach((key) => {
      if (enteredAddress[key] && typeof enteredAddress[key] === "string" && requiredFields.indexOf(key) > -1) {
        enteredAddress[key] = enteredAddress[key].trim();
      }
      if (requiredFields.indexOf(key) > -1 && !enteredAddress[key]) {
        validation.messages[key] = {
          message: `${this.fieldLabelMap[key].label} is required`
        };
        isValid = false;
      }
    });
    if (!isValid) {
      this.setState({
        validation
      });
    } else {
      this.setState({
        validation: undefined
      });
    }
    return isValid;
  }

  // Address Book Form Actions

  /**
   * @method onSubmit
   * @summary takes the entered address and adds or updates it to the addressBook.
   * @since 2.0.0
   * @ignore
   */
  onSubmit = (event) => {
    event.preventDefault();
    const { add } = this.props;
    const { fields: enteredAddress } = this.state; // fields object as enteredAddress
    // TODO: field validatiion
    if (this.clientValidation(enteredAddress)) {
      add(enteredAddress);
    }
  }

  /**
   * @method onFieldChange
   * @summary when field values change update the value in state
   * @since 2.0.0
   * @ignore
   */
  onFieldChange = (event, value, name) => {
    const { fields } = this.state;
    fields[name] = value;
    this.setState({ fields });
    // if country changed set new region options
    if (name === "country") this.setRegionOptions(value);
  }

  /**
   * @method onSelectChange
   * @summary normalizes the select components onChange.
   * @since 2.0.0
   * @ignore
   */
  onSelectChange = (value, name) => {
    // the reaction select component doesn't return
    // the same values as the other field components
    // this updates that return and calls the
    // typical on field change handler
    this.onFieldChange(new Event("onSelect"), value, name);
  }

  // Address Book Form JSX

  /**
   * @method renderAddressOptiions
   * @summary renders address options at the bottom of the address book form
   * if no address in addressBook array only show the isCommercial option
   * since a first address will always be the default shipping/billing address.
   * @since 2.0.0
   * @return {Object} - JSX and Checkbox components.
   * @ignore
   */
  renderAddressOptions() {
    const { hasAddress } = this.props;
    const { fields } = this.state;
    let defaultOptions;
    if (hasAddress) {
      defaultOptions = (
        <div>
          <div className="form-group">
            <div className="checkbox">
              <Components.Checkbox
                i18nKeyLabel="address.isShippingDefault"
                label="Make this your default shipping address."
                name="isShippingDefault"
                onChange={this.onFieldChange}
                checked={fields.isShippingDefault}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="checkbox">
              <Components.Checkbox
                i18nKeyLabel="address.isBillingDefault"
                label="Make this your default billing address."
                name="isBillingDefault"
                onChange={this.onFieldChange}
                checked={fields.isBillingDefault}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="row address-options" style={{ paddingLeft: "5px" }}>
        <div className="col-md-12">
          {defaultOptions}
          <div className="form-group">
            <div className="checkbox">
              <Components.Checkbox
                i18nKeyLabel="address.isCommercial"
                label="This is a commercal address."
                name="isCommercial"
                onChange={this.onFieldChange}
                checked={fields.isCommercial}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * @method renderButtons
   * @summary renders submit and cancel buttons for address book form
   * if no address in addressBook array don't show the cancel button
   * since the user needs to add a default address.
   * @since 2.0.0
   * @return {Object} - JSX
   * @ignore
   */
  renderButtons() {
    const { cancel, hasAddress } = this.props;
    const cancelBtn = (
      <Components.Button
        buttonType="reset"
        className="btn btn-default"
        bezelStyle="solid"
        onClick={cancel}
        i18nKeyLabel="app.cancel"
        label="Cancel"
      />
    );
    return (
      <div className="row text-right">
        <Components.Button
          buttonType="submit"
          className="btn btn-primary"
          bezelStyle="solid"
          i18nKeyLabel="app.saveAndContinue"
          label="Save and continue"
        />
        {(hasAddress) ? cancelBtn : ""}
      </div>
    );
  }

  render() {
    const { countries } = this.props;
    const { regions, fields, validation } = this.state;
    let regionField;
    if (regions.length === 0) {
      // if no region optioins
      // render a TextField
      regionField = (
        <Components.TextField
          i18nKeyLabel={this.fieldLabelMap.region.i18nKeyLabel}
          label={this.fieldLabelMap.region.label}
          name="region"
          onChange={this.onFieldChange}
          value={fields.region}
          validation={validation}
        />
      );
    } else {
      // if region optioins
      // render a Select
      regionField = (
        <Components.Select
          i18nKeyLabel={this.fieldLabelMap.region.i18nKeyLabel}
          label={this.fieldLabelMap.region.label}
          name="region"
          options={regions}
          onChange={this.onSelectChange}
          value={fields.region}
          validation={validation}
        />
      );
    }
    return (
      <form onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-md-6">
            <Components.Select
              i18nKeyLabel={this.fieldLabelMap.country.i18nKeyLabel}
              label={this.fieldLabelMap.country.label}
              name="country"
              options={countries}
              onChange={this.onSelectChange}
              placeholder="Country"
              value={fields.country}
              validation={validation}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Components.TextField
              i18nKeyLabel={this.fieldLabelMap.fullName.i18nKeyLabel}
              label={this.fieldLabelMap.fullName.label}
              name="fullName"
              onChange={this.onFieldChange}
              value={fields.fullName}
              validation={validation}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Components.TextField
              i18nKeyLabel={this.fieldLabelMap.address1.i18nKeyLabel}
              label={this.fieldLabelMap.address1.label}
              name="address1"
              onChange={this.onFieldChange}
              value={fields.address1}
              validation={validation}
            />
          </div>
          <div className="col-md-6">
            <Components.TextField
              i18nKeyLabel={this.fieldLabelMap.address2.i18nKeyLabel}
              label={this.fieldLabelMap.address2.label}
              name="address2"
              onChange={this.onFieldChange}
              value={fields.address2}
              validation={validation}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Components.TextField
              i18nKeyLabel={this.fieldLabelMap.postal.i18nKeyLabel}
              label={this.fieldLabelMap.postal.label}
              name="postal"
              onChange={this.onFieldChange}
              value={fields.postal}
              validation={validation}
            />
          </div>
          <div className="col-md-4">
            <Components.TextField
              i18nKeyLabel={this.fieldLabelMap.city.i18nKeyLabel}
              label={this.fieldLabelMap.city.label}
              name="city"
              onChange={this.onFieldChange}
              value={fields.city}
              validation={validation}
            />
          </div>
          <div className="col-md-4">
            {regionField}
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Components.TextField
              i18nKeyLabel={this.fieldLabelMap.phone.i18nKeyLabel}
              label={this.fieldLabelMap.phone.label}
              name="phone"
              onChange={this.onFieldChange}
              value={fields.phone}
              validation={validation}
            />
          </div>
        </div>

        {this.renderAddressOptions()}
        {this.renderButtons()}
      </form>
    );
  }
}

registerComponent("AddressBookForm", AddressBookForm);

export default AddressBookForm;
