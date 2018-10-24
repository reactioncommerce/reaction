import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import AccordionFormList from "./AccordionFormList";
import AddressValidationSettingsForm from "./AddressValidationSettingsForm";

export default class ShopAddressValidationSettings extends Component {
  static propTypes = {
    countryOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })),
    enabledServices: PropTypes.arrayOf(PropTypes.shape({
      countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
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

  get listItems() {
    const { countryOptions, enabledServices, onItemEdited, serviceOptions } = this.props;

    return enabledServices.map((item) => ({
      detail: item.countryCodes.join(", "),
      id: item._id,
      itemEditFormProps: {
        countryOptions,
        onSubmit: (doc) => onItemEdited(item._id, doc),
        serviceOptions,
        value: item
      },
      label: item.serviceDisplayName
    }));
  }

  render() {
    const { countryOptions, onItemAdded, onItemDeleted, serviceOptions } = this.props;

    const itemAddFormProps = {
      countryOptions,
      onSubmit: (doc) => onItemAdded(doc),
      serviceOptions
    };

    return (
      <div className="clearfix">
        <p>{i18next.t("addressValidation.helpText")}</p>
        <AccordionFormList
          addNewItemButtonText={i18next.t("addressValidation.addNewItemButtonText")}
          components={{ ItemAddForm: AddressValidationSettingsForm, ItemEditForm: AddressValidationSettingsForm }}
          deleteItemButtonText={i18next.t("addressValidation.deleteItemButtonText")}
          entryFormSubmitButtonText={i18next.t("addressValidation.entryFormSubmitButtonText")}
          itemAddFormProps={itemAddFormProps}
          items={this.listItems}
          onItemDeleted={onItemDeleted}
        />
      </div>
    );
  }
}
