import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Button from "@reactioncommerce/catalyst/Button";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import AddressValidationSettingsForm from "./AddressValidationSettingsForm";

export default class ShopAddressValidationSettings extends Component {
  static propTypes = {
    addressValidationServices: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      supportedCountryCodes: PropTypes.arrayOf(PropTypes.string)
    })),
    countryOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })),
    enabledServices: PropTypes.arrayOf(PropTypes.shape({
      countryCodes: PropTypes.arrayOf(PropTypes.string),
      serviceDisplayName: PropTypes.string.isRequired,
      serviceName: PropTypes.string.isRequired
    })),
    onItemAdded: PropTypes.func.isRequired,
    onItemDeleted: PropTypes.func.isRequired,
    onItemEdited: PropTypes.func.isRequired
  };

  static defaultProps = {
    addressValidationServices: [],
    countryOptions: [],
    enabledServices: []
  };

  state = {
    isAdding: false,
    selectedServiceNameInAddForm: null
  }

  showAddForm = () => {
    this.setState({ isAdding: true });
  };

  hideAddForm = () => {
    this.setState({ isAdding: false });
  };

  handleAddFormSubmit = (...args) => {
    const { onItemAdded } = this.props;
    return onItemAdded(...args)
      .then((result) => {
        this.hideAddForm();
        return result;
      });
  };

  handleAddFormSubmitButton = () => {
    if (this.addForm) {
      this.addForm.submit();
    }
  };

  handleAddFormChange = (doc) => {
    this.setState({ selectedServiceNameInAddForm: doc.serviceName });
  };

  get serviceOptions() {
    const { addressValidationServices } = this.props;

    return (addressValidationServices || []).map((addressValidationService) => ({
      label: addressValidationService.displayName,
      value: addressValidationService.name
    }));
  }

  get supportedCountryOptions() {
    const { addressValidationServices, countryOptions } = this.props;
    const { selectedServiceNameInAddForm } = this.state;

    // Don't show any countries in the list until they've selected a service
    if (!selectedServiceNameInAddForm) return [];

    const selectedService = (addressValidationServices || []).find((service) =>
      service.name === selectedServiceNameInAddForm);

    if (!selectedService || !Array.isArray(selectedService.supportedCountryCodes)) return countryOptions;

    return countryOptions.filter(({ value }) => selectedService.supportedCountryCodes.includes(value));
  }

  renderAddForm() {
    return (
      <div>
        <AddressValidationSettingsForm
          countryOptions={this.supportedCountryOptions}
          onChange={this.handleAddFormChange}
          onSubmit={this.handleAddFormSubmit}
          ref={(instance) => { this.addForm = instance; }}
          serviceOptions={this.serviceOptions}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={this.hideAddForm}>{i18next.t("addressValidation.cancelButtonText")}</Button>
          <div style={{ marginLeft: 14 }}>
            <Button variant="contained" color="secondary" onClick={this.handleAddFormSubmitButton}>
              {i18next.t("addressValidation.entryFormSubmitButtonText")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { addressValidationServices, enabledServices, onItemDeleted } = this.props;
    const { isAdding } = this.state;

    return (
      <div className="clearfix">
        <p>{i18next.t("addressValidation.helpText")}</p>
        <SortableTable
          className="-striped -highlight"
          data={enabledServices}
          columnMetadata={[
            {
              accessor: "serviceDisplayName",
              Header: "Name"
            },
            {
              accessor: (item) => {
                const countries = item.countryCodes || [];
                if (countries.length === 0) {
                  const selectedService = (addressValidationServices || []).find((service) => service.name === item.serviceName);
                  if (selectedService && selectedService.supportedCountryCodes) return selectedService.supportedCountryCodes.join(", ");
                  return "All";
                }
                return countries.join(", ");
              },
              Header: "Countries",
              id: "countries"
            },
            {
              accessor: "_id",
              Cell: (row) => (
                <Button color="error" variant="outlined" size="small" onClick={() => { onItemDeleted(row.value); }}>
                  {i18next.t("addressValidation.deleteItemButtonText")}
                </Button>
              )
            }
          ]}
          filterType="none"
        />
        {!isAdding && <Button color="secondary" variant="contained" fullWidth onClick={this.showAddForm}>
          {i18next.t("addressValidation.addNewItemButtonText")}
        </Button>}
        {!!isAdding && this.renderAddForm()}
      </div>
    );
  }
}
