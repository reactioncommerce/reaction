/* eslint-disable promise/no-promise-in-callback */
import React, { Component } from "react";
import PropTypes from "prop-types";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { Shipping } from "/lib/collections";
import { Reaction, formatPriceString, i18next } from "/client/api";
import { IconButton, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import ShippingMethodForm from "./ShippingMethodForm";

const fulfillmentMethodFormSchema = new SimpleSchema({
  name: String,
  label: String,
  group: {
    type: String,
    allowedValues: ["Free", "Ground", "One Day", "Priority"]
  },
  cost: {
    type: Number,
    optional: true
  },
  handling: {
    type: Number,
    min: 0
  },
  rate: {
    type: Number,
    min: 0
  },
  isEnabled: Boolean
});

const fulfillmentMethodValidator = fulfillmentMethodFormSchema.getFormValidator();
const groupOptions = fulfillmentMethodFormSchema.getAllowedValuesForKey("group").map((groupName) => ({ label: groupName, value: groupName }));

const customRowMetaData = {
  bodyCssClassName: () => "shipping-grid-row"
};

/**
 * @summary filter and extract shipping methods from flat rate shipping provider
 * @param {Object[]} results The find results
 * @returns {Object[]} The methods from the flatRates record
 */
function transform(results) {
  const provider = results.find((shippingRecord) => shippingRecord.provider && shippingRecord.provider.name === "flatRates");
  if (!provider) return [];

  return (provider.methods || []).map((method) => ({
    ...method,
    rate: formatPriceString(method.rate)
  }));
}

export default class ShippingRatesSettings extends Component {
  static propTypes = {
    fulfillmentMethods: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string
    }))
  };

  state = {
    isEditing: false,
    editingId: null
  };

  handleEditClick = () => {
    const { isEditing = false } = this.state;
    let { editingId = null } = this.state;

    if (!isEditing) {
      editingId = null;
    }

    this.setState({
      isEditing: !isEditing,
      editingId
    });
  };

  handleRowClick = (options) => {
    const { editingId = null } = this.state;

    const clickedId = options.props.data._id;
    if (editingId === clickedId) {
      this.setState({
        isEditing: false,
        editingId: null
      });
    } else {
      this.setState({
        isEditing: true,
        editingId: clickedId
      });
    }
  };

  handleFormCancel = () => {
    this.setState({
      isEditing: false,
      editingId: null
    });
  };

  handleFormDelete = () => {
    const { editingId = null } = this.state;

    const confirmTitle = i18next.t("admin.shippingSettings.confirmRateDelete");
    const confirmButtonText = i18next.t("app.delete");

    // confirm delete
    Alerts.alert({
      title: confirmTitle,
      type: "warning",
      showCancelButton: true,
      confirmButtonText
    }, (isConfirm) => {
      if (isConfirm && editingId) {
        const methodInput = [
          { namespace: "Shop", id: Reaction.getShopId() },
          { namespace: "FulfillmentMethod", id: editingId }
        ];
        Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
          const [opaqueShopId, opaqueEditingId] = opaqueIds;

          simpleGraphQLClient.mutations.deleteFlatRateFulfillmentMethod({
            input: {
              methodId: opaqueEditingId,
              shopId: opaqueShopId
            }
          })
            .then(() => {
              this.setState({
                isEditing: false,
                editingId: null
              });
              Alerts.toast(i18next.t("shipping.shippingMethodDeleted"), "success");
              return null;
            })
            .catch((error2) => {
              Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error2}`, "error");
            });
        });
      }
    });
  };

  handleFormValidate = (doc) => fulfillmentMethodValidator(fulfillmentMethodFormSchema.clean(doc));

  handleFormSubmit = (doc) => {
    const { editingId = null } = this.state;

    // We don't yet have a NumberInput, so we'll make these strings for now.
    // Remove this and switch to NumberInput once we have it.
    const cleanedDoc = fulfillmentMethodFormSchema.clean(doc);

    // For now, we hard code a single fulfillment type
    cleanedDoc.fulfillmentTypes = ["shipping"];

    return new Promise((resolve) => {
      if (editingId) {
        const methodInput = [
          { namespace: "Shop", id: Reaction.getShopId() },
          { namespace: "FulfillmentMethod", id: editingId }
        ];
        Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
          const [opaqueShopId, opaqueEditingId] = opaqueIds;

          simpleGraphQLClient.mutations.updateFlatRateFulfillmentMethod({
            input: {
              methodId: opaqueEditingId,
              method: cleanedDoc,
              shopId: opaqueShopId
            }
          })
            .then(() => {
              this.setState({
                isEditing: false,
                editingId: null
              });
              Alerts.toast(i18next.t("admin.shippingSettings.rateSaved"), "success");
              resolve();
              return null;
            })
            .catch((error2) => {
              Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error2}`, "error");
              resolve({ ok: false });
            });
        });
      } else {
        const methodInput = [
          { namespace: "Shop", id: Reaction.getShopId() }
        ];
        Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
          const [opaqueShopId] = opaqueIds;
          simpleGraphQLClient.mutations.createFlatRateFulfillmentMethod({
            input: {
              method: cleanedDoc,
              shopId: opaqueShopId
            }
          })
            .then(() => {
              this.setState({
                isEditing: true,
                editingId: null
              });
              Alerts.toast(i18next.t("admin.shippingSettings.rateSaved"), "success");
              resolve();
              return null;
            })
            .catch((error2) => {
              Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error2}`, "error");
              resolve({ ok: false });
            });
        });
      }
    });
  };

  renderShippingGrid() {
    const filteredFields = ["name", "group", "label", "rate"];
    const noDataMessage = i18next.t("admin.shippingSettings.noRatesFound");

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.shippingGrid.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <SortableTable
        collection={Shipping}
        columnMetadata={customColumnMetadata}
        columns={filteredFields}
        externalLoadingComponent={Loading}
        filteredFields={filteredFields}
        matchingResultsCount="shipping-count"
        noDataMessage={noDataMessage}
        onRowClick={this.handleRowClick}
        publication="Shipping"
        rowMetadata={customRowMetaData}
        showFilter
        tableClassName="-striped -highlight shippingGrid"
        transform={transform}
      />
    );
  }

  renderEditButton() {
    const { isEditing = false } = this.state;

    return (
      <div className="clearfix">
        <div className="pull-right">
          <IconButton
            icon="fa fa-plus"
            onIcon="fa fa-pencil"
            toggle
            toggleOn={isEditing}
            style={{
              position: "relative",
              top: "-25px",
              right: "8px"
            }}
            onClick={this.handleEditClick}
          />
        </div>
      </div>
    );
  }

  renderShippingMethodForm() {
    const { fulfillmentMethods } = this.props;
    const { editingId } = this.state;

    let methodDoc = null;
    if (editingId && fulfillmentMethods && fulfillmentMethods.length) {
      methodDoc = fulfillmentMethods.find((method) => method._id === editingId);
      // We don't yet have a NumberInput, so we'll make these strings for now.
      // Remove this and switch to NumberInput once we have it.
      if (methodDoc) {
        methodDoc = {
          ...methodDoc,
          cost: typeof methodDoc.cost === "number" ? methodDoc.cost.toString() : methodDoc.cost,
          handling: typeof methodDoc.handling === "number" ? methodDoc.handling.toString() : methodDoc.handling,
          isEnabled: typeof methodDoc.isEnabled === "boolean" ? methodDoc.isEnabled : (methodDoc.enabled || false), // backwards compatible
          rate: typeof methodDoc.rate === "number" ? methodDoc.rate.toString() : methodDoc.rate
        };
      }
    }

    // We set the labels in here so that the error messages have the correct matching label.
    // We can't set them in top-level code because translations are not loaded yet.
    fulfillmentMethodFormSchema.labels({
      cost: i18next.t("shippingMethod.cost"),
      isEnabled: i18next.t("shippingMethod.enabled"),
      group: i18next.t("shippingMethod.group"),
      handling: i18next.t("shippingMethod.handling"),
      label: i18next.t("shippingMethod.label"),
      name: i18next.t("shippingMethod.name"),
      rate: i18next.t("shippingMethod.rate")
    });

    return (
      <ShippingMethodForm
        groupOptions={groupOptions}
        isEditing={!!editingId}
        methodDoc={methodDoc}
        onCancel={this.handleFormCancel}
        onDelete={this.handleFormDelete}
        validator={this.handleFormValidate}
        onSubmit={this.handleFormSubmit}
      />
    );
  }

  render() {
    const { isEditing = false } = this.state;

    return (
      <div>
        {this.renderShippingGrid()}
        {this.renderEditButton()}
        {isEditing && this.renderShippingMethodForm()}
      </div>
    );
  }
}
