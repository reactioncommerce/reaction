import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { AutoForm } from "meteor/aldeed:autoform";
import { Shops } from "/lib/collections";
import { Countries } from "/client/collections";
import { Shipping } from "/lib/collections";
import { i18next } from "/client/api";
import { Shipping as ShippingSchema } from "/lib/collections/schemas";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { IconButton, Loading } from "/imports/plugins/core/ui/client/components";

/* eslint no-shadow: ["error", { "allow": ["options"] }] */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "[oO]ptions" }] */

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
    const state = instance.state;
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
        $(".tax-grid-row").removeClass("active");
        return state.set({
          isEditing: !isEditing,
          editingId: editingId
        });
      }
    };
  },
  shippingGrid() {
    const filteredFields = ["group", "label", "rate"];
    const noDataMessage = i18next.t("admin.shippingSettings.noCustomShippingRatesFound");
    const instance = Template.instance();

    //
    // helper to get and select row from griddle
    // into blaze for to select tax row for editing
    //
    function editRow(options) {
      const currentId = instance.state.get("editingId");
      // isEditing is tax rate object
      instance.state.set("isEditing", options.props.data);
      instance.state.set("editingId", options.props.data._id);
      // toggle edit mode clicking on same row
      if (currentId === options.props.data._id) {
        instance.state.set("isEditing", null);
        instance.state.set("editingId", null);
      }
    }

    //
    // helper adds a class to every grid row
    //
    const customRowMetaData = {
      bodyCssClassName: () =>  {
        return "tax-grid-row";
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
    console.log(Shipping.find().fetch())
    // return tax Grid
    return {
      component: MeteorGriddle,
      publication: "Shipping",
      collection: Shipping,
      matchingResultsCount: "shipping-count",
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
  // schema for forms
  shippingSchema() {
    return ShippingSchema;
  }
});

//
// on submit lets clear the form state
//
Template.shippingRatesSettings.events({
  "submit #shippingRatesSettings-update-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "submit #shippingRatesSettings-insert-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .tax-grid-row .active": function () {
    instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".tax-grid-row").removeClass("active");
  },
  "click .delete": function () {
    const confirmTitle = i18next.t("admin.shippingSettings.confirmRateDelete");
    const confirmButtonText = i18next.t("app.delete");
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    // confirm delete
    Alerts.alert({
      title: confirmTitle,
      type: "warning",
      showCancelButton: true,
      confirmButtonText: confirmButtonText
    }, (isConfirm) => {
      if (isConfirm) {
        if (id) {
          Meteor.call("taxes/deleteRate", id);
          instance.state.set({
            isEditing: false,
            editingId: null
          });
        }
      }
    });
  },
  "click .tax-grid-row": function (event) {
    // toggle all rows off, then add our active row
    $(".tax-grid-row").removeClass("active");
    $(event.currentTarget).addClass("active");
  }
});

//
// Hooks for update and insert forms
//
AutoForm.hooks({
  "shippingRatesSettings-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.shippingSettings.shopCustomShippingRatesSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.shippingSettings.shopCustomShippingRatesFailed")} ${error}`, "error"
      );
    }
  },
  "shippingRatesSettings-insert-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.shippingSettings.shopCustomShippingRatesSaved"), "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.shippingSettings.shopCustomShippingRatesFailed")} ${error}`, "error"
      );
    }
  }
});
