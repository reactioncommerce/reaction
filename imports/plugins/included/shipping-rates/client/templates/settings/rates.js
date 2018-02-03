import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { AutoForm } from "meteor/aldeed:autoform";
import { Shipping } from "/lib/collections";
import { i18next } from "/client/api";
import { IconButton, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";

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
      const result = [];
      for (const method of results) {
        if (method.provider && method.provider.name === "flatRates") {
          result.push(method.methods);
        }
      }
      return result[0];
    }

    // return shipping Grid
    return {
      component: SortableTable,
      publication: "Shipping",
      transform,
      collection: Shipping,
      matchingResultsCount: "shipping-count",
      showFilter: true,
      rowMetadata: customRowMetaData,
      filteredFields,
      columns: filteredFields,
      noDataMessage,
      onRowClick: editRow,
      columnMetadata: customColumnMetadata,
      externalLoadingComponent: Loading
    };
  },

  instance() {
    const instance = Template.instance();
    return instance;
  },

  shippingRate() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const providerRates = Shipping.findOne({ "provider.name": "flatRates" }) || {};
    let rate = {};
    if (providerRates && providerRates.methods) {
      if (id) {
        for (const method of providerRates.methods) {
          if (method._id === id) {
            rate = method;
          }
        }
      } else {
        // a little trick to provide _id for insert
        rate._id = providerRates._id;
      }
    }
    return rate;
  }
});

//
// on submit lets clear the form state
//
Template.shippingRatesSettings.events({
  "submit #shipping-rates-update-form"() {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "submit #shipping-rates-insert-form"() {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .shipping-grid-row .active"() {
    const instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".shipping-grid-row").removeClass("active");
  },
  "click .delete"() {
    const confirmTitle = i18next.t("admin.shippingSettings.confirmRateDelete");
    const confirmButtonText = i18next.t("app.delete");
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    // confirm delete
    Alerts.alert({
      title: confirmTitle,
      type: "warning",
      showCancelButton: true,
      confirmButtonText
    }, (isConfirm) => {
      if (isConfirm) {
        if (id) {
          Meteor.call("shipping/rates/delete", id);
          instance.state.set({
            isEditing: false,
            editingId: null
          });
        }
      }
    });
  },
  "click .shipping-grid-row"(event) {
    // toggle all rows off, then add our active row
    $(".shipping-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  }
});

//
// Hooks for update and insert forms
//
AutoForm.hooks({
  "shipping-rates-update-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.shippingSettings.rateSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error}`, "error");
    }
  },
  "shipping-rates-insert-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.shippingSettings.rateSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.shippingSettings.rateFailed")} ${error}`, "error");
    }
  }
});
