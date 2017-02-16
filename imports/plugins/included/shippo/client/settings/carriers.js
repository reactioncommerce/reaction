import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { AutoForm } from "meteor/aldeed:autoform";
import { Shipping } from "/lib/collections";
import { i18next } from "/client/api";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { Loading } from "/imports/plugins/core/ui/client/components";

import "./carriers.html";

Template.shippoCarriers.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});

Template.shippoCarriers.helpers({
  carrierGrid() {
    const filteredFields = ["name", "carrier", "label", "enabled"];
    const noDataMessage = i18next.t("admin.shippingSettings.noCarriersFound");
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

    // add shipping-carriers-grid-row class
    const customRowMetaData = {
      bodyCssClassName: () =>  {
        return "shipping-carriers-grid-row";
      }
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach(function (field) {
      const columnMeta = {
        columnName: field,
        displayName: i18next.t(`admin.shippingGrid.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // filter and extract shipping methods
    // from flat rate shipping provider
    function transform(results) {
      const result = [];
      for (const method of results) {
        if (method.provider && typeof method.provider.shippoProvider === "object") {
          method.provider.carrier = method.name;
          result.push(method.provider);
        }
      }
      return result;
    }

    // return shipping Grid
    return {
      component: MeteorGriddle,
      publication: "Shipping",
      transform: transform,
      collection: Shipping,
      showFilter: true,
      useGriddleStyles: false,
      rowMetadata: customRowMetaData,
      filteredFields: filteredFields,
      columns: filteredFields,
      noDataMessage: noDataMessage,
      onRowClick: editRow,
      columnMetadata: customColumnMetadata,
      externalLoadingComponent: Loading
    };
  },

  instance() {
    const instance = Template.instance();
    return instance;
  },

  shippoCarrier() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const shippoCarriers = Shipping.findOne({ "provider._id": id });
    return shippoCarriers.provider;
  }
});

//
// on submit lets clear the form state
//
Template.shippoCarriers.events({
  "submit #shipping-carrier-insert-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .shipping-carriers-grid-row .active": function () {
    instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".shipping-carriers-grid-row").removeClass("active");
  },
  "click .shipping-carriers-grid-row": function (event) {
    // toggle all rows off, then add our active row
    $(".shipping-carriers-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  }
});

//
// Hooks for update and insert forms
//
AutoForm.hooks({
  "shipping-carrier-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.shippingSettings.carrierSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.shippingSettings.carrierFailed")} ${error}`, "error"
      );
    }
  }
});
