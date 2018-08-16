import SimpleSchema from "simpl-schema";
import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shipping } from "/lib/collections";
import { formatPriceString, i18next } from "/client/api";
import { IconButton, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
import ShippingMethodForm from "../../../components/ShippingMethodForm";

const fulfillmentMethodFormSchema = new SimpleSchema({
  "name": String,
  "label": String,
  "group": {
    type: String,
    allowedValues: ["Free", "Ground", "One Day", "Priority"]
  },
  "cost": {
    type: Number,
    optional: true
  },
  "handling": {
    type: Number,
    min: 0
  },
  "rate": {
    type: Number,
    min: 0
  },
  "enabled": Boolean
});

const fulfillmentMethodValidator = fulfillmentMethodFormSchema.getFormValidator();
const groupOptions = fulfillmentMethodFormSchema.getAllowedValuesForKey("group").map((groupName) => ({ label: groupName, value: groupName }));

Template.shippingRatesSettings.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});

Template.shippingRatesSettings.helpers({
  editButton() {
    const instance = Template.instance();
    const { state } = instance;
    const isEditing = state.equals("isEditing", true);
    let editingId = state.get("editingId");
    // toggle edit state
    if (!isEditing) {
      editingId = null;
    }
    // return icon
    return {
      component: IconButton,
      icon: "fa fa-plus",
      onIcon: "fa fa-pencil",
      toggle: true,
      toggleOn: isEditing,
      style: {
        position: "relative",
        top: "-25px",
        right: "8px"
      },
      onClick() {
        // remove active rows from grid
        $(".shipping-grid-row").removeClass("active");
        return state.set({
          isEditing: !isEditing,
          editingId
        });
      }
    };
  },
  shippingGrid() {
    const filteredFields = ["name", "group", "label", "rate"];
    const noDataMessage = i18next.t("admin.shippingSettings.noRatesFound");
    const instance = Template.instance();

    // griddle helper to select row
    function editRow(options) {
      const currentId = instance.state.get("editingId");
      // isEditing is shipping rate object
      instance.state.set("isEditing", options.props.data);
      instance.state.set("editingId", options.props.data._id);
      // toggle edit mode clicking on same row
      if (currentId === options.props.data._id) {
        instance.state.set("isEditing", null);
        instance.state.set("editingId", null);
      }
    }

    // add shipping-grid-row class
    const customRowMetaData = {
      bodyCssClassName: () => "shipping-grid-row"
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.shippingGrid.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // filter and extract shipping methods
    // from flat rate shipping provider
    function transform(results) {
      const provider = results.find((shippingRecord) => shippingRecord.provider && shippingRecord.provider.name === "flatRates");
      if (!provider) return [];

      return (provider.methods || []).map((method) => ({
        ...method,
        rate: formatPriceString(method.rate)
      }));
    }

    // return shipping Grid
    return {
      collection: Shipping,
      columnMetadata: customColumnMetadata,
      columns: filteredFields,
      component: SortableTable,
      externalLoadingComponent: Loading,
      filteredFields,
      matchingResultsCount: "shipping-count",
      noDataMessage,
      onRowClick: editRow,
      publication: "Shipping",
      rowMetadata: customRowMetaData,
      showFilter: true,
      tableClassName: "-striped -highlight shippingGrid",
      transform
    };
  },

  instance() {
    const instance = Template.instance();
    return instance;
  },

  shippingMethodForm() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");

    let methodDoc = null;
    if (id) {
      const providerRates = Shipping.findOne({ "provider.name": "flatRates" });
      if (providerRates && providerRates.methods) {
        methodDoc = providerRates.methods.find((method) => method._id === id);
        // We don't yet have a NumberInput, so we'll make these strings for now.
        // Remove this and switch to NumberInput once we have it.
        if (methodDoc) {
          methodDoc = {
            ...methodDoc,
            cost: typeof methodDoc.cost === "number" ? methodDoc.cost.toString() : methodDoc.cost,
            handling: typeof methodDoc.handling === "number" ? methodDoc.handling.toString() : methodDoc.handling,
            rate: typeof methodDoc.rate === "number" ? methodDoc.rate.toString() : methodDoc.rate
          };
        }
      }
    }

    // We set the labels in here so that the error messages have the correct matching label.
    // We can't set them in top-level code because translations are not loaded yet.
    fulfillmentMethodFormSchema.labels({
      cost: i18next.t("shippingMethod.cost"),
      enabled: i18next.t("shippingMethod.enabled"),
      group: i18next.t("shippingMethod.group"),
      handling: i18next.t("shippingMethod.handling"),
      label: i18next.t("shippingMethod.label"),
      name: i18next.t("shippingMethod.name"),
      rate: i18next.t("shippingMethod.rate")
    });

    return {
      component: ShippingMethodForm,
      groupOptions,
      isEditing: !!id,
      methodDoc,
      onCancel() {
        instance.state.set({
          isEditing: false,
          editingId: null
        });
      },
      onDelete() {
        const confirmTitle = i18next.t("admin.shippingSettings.confirmRateDelete");
        const confirmButtonText = i18next.t("app.delete");
        // confirm delete
        Alerts.alert({
          title: confirmTitle,
          type: "warning",
          showCancelButton: true,
          confirmButtonText
        }, (isConfirm) => {
          if (isConfirm) {
            if (id) {
              Meteor.call("shipping/rates/delete", id, (error) => {
                if (error) {
                  Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error}`, "error");
                  return;
                }
                instance.state.set({
                  isEditing: false,
                  editingId: null
                });
                Alerts.toast(i18next.t("shipping.shippingMethodDeleted"), "success");
              });
            }
          }
        });
      },
      validator(doc) {
        return fulfillmentMethodValidator(fulfillmentMethodFormSchema.clean(doc));
      },
      onSubmit(doc) {
        // We don't yet have a NumberInput, so we'll make these strings for now.
        // Remove this and switch to NumberInput once we have it.
        const cleanedDoc = fulfillmentMethodFormSchema.clean(doc);

        return new Promise((resolve, reject) => {
          if (id) {
            Meteor.call("shipping/rates/update", { ...cleanedDoc, _id: id }, (error) => {
              if (error) {
                Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error}`, "error");
                resolve({ ok: false });
                return;
              }
              instance.state.set({
                isEditing: false,
                editingId: null
              });
              Alerts.toast(i18next.t("admin.shippingSettings.rateSaved"), "success");
              resolve();
            });
          } else {
            Meteor.call("shipping/rates/add", cleanedDoc, (error) => {
              if (error) {
                Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error}`, "error");
                resolve({ ok: false });
                return;
              }
              instance.state.set({
                isEditing: true,
                editingId: null
              });
              Alerts.toast(i18next.t("admin.shippingSettings.rateSaved"), "success");
              resolve();
            });
          }
        });
      }
    };
  }
});
