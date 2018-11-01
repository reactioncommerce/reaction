import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Button from "@reactioncommerce/components/Button/v1";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import AddressValidationSettingsForm from "./AddressValidationSettingsForm";

export default class ShopAddressValidationSettings extends Component {
  static propTypes = {
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
    onItemEdited: PropTypes.func.isRequired,
    serviceOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }))
  };

  static defaultProps = {
    countryOptions: [],
    enabledServices: [],
    serviceOptions: []
  };

  state = {
    isAdding: false
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

  renderAddForm() {
    const { countryOptions, serviceOptions } = this.props;

    return (
      <div>
        <AddressValidationSettingsForm
          countryOptions={countryOptions}
          onSubmit={this.handleAddFormSubmit}
          ref={(instance) => { this.addForm = instance; }}
          serviceOptions={serviceOptions}
        />
        <Button actionType="secondary" onClick={this.hideAddForm}>{i18next.t("addressValidation.cancelButtonText")}</Button>
        <Button actionType="important" onClick={this.handleAddFormSubmitButton}>{i18next.t("addressValidation.entryFormSubmitButtonText")}</Button>
      </div>
    );
  }

  render() {
    const { enabledServices, onItemDeleted } = this.props;
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
                if (countries.length === 0) return "All";
                return countries.join(", ");
              },
              Header: "Countries",
              id: "countries"
            },
            {
              Cell: (row) => (
                <Button actionType="secondaryDanger" isShortHeight onClick={() => { onItemDeleted(row.value._id); }}>
                  {i18next.t("addressValidation.deleteItemButtonText")}
                </Button>
              )
            }
          ]}
          filterType="none"
        />
        {!isAdding && <Button actionType="important" onClick={this.showAddForm}>{i18next.t("addressValidation.addNewItemButtonText")}</Button>}
        {!!isAdding && this.renderAddForm()}
      </div>
    );
  }
}
