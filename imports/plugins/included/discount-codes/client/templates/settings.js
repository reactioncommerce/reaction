import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { AutoForm } from "meteor/aldeed:autoform";
import { DiscountCodes } from "../collections/codes";
import { i18next } from "/client/api";
import { DiscountCodes as DiscountSchema } from "../../lib/collections/schemas";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { IconButton, Loading }  from "/imports/plugins/core/ui/client/components";
import "./settings.html";

/* eslint no-shadow: ["error", { "allow": ["options"] }] */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "[oO]ptions" }] */

Template.customDiscountCodes.onCreated(function () {
  this.autorun(() => {
    this.subscribe("DiscountCodes");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});

Template.customDiscountCodes.helpers({
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
        $(".discount-codes-grid-row").removeClass("active");
        return state.set({
          isEditing: !isEditing,
          editingId: editingId
        });
      }
    };
  },
  discountGrid() {
    const filteredFields = ["code", "discount", "conditions.redemptionLimit", "calculation.method"];
    const noDataMessage = i18next.t("admin.settings.noCustomDiscountCodesFound");
    const instance = Template.instance();

    //
    // helper to get and select row from griddle
    // into blaze for to select discount row for editing
    //
    function editRow(options) {
      const currentId = instance.state.get("editingId");
      // isEditing is discount rate object
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
        return "discount-codes-grid-row";
      }
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach(function (field) {
      const columnMeta = {
        columnName: field,
        displayName: i18next.t(`admin.discountGrid.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // return discount Grid
    return {
      component: MeteorGriddle,
      publication: "DiscountCodes",
      collection: DiscountCodes,
      matchingResultsCount: "discounts-count",
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
  discountSchema() {
    return DiscountSchema;
  },

  discountCode() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const discount = DiscountCodes.findOne(id) || {};
    return discount;
  }
});

//
// on submit lets clear the form state
//
Template.customDiscountCodes.events({
  "submit #discount-codes-update-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "submit #discount-codes-insert-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .discount-codes-grid-row .active": function () {
    instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".discount-codes-grid-row").removeClass("active");
  },
  "click .delete": function () {
    const confirmTitle = i18next.t("admin.settings.confirmRateDelete");
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
          Meteor.call("discounts/deleteRate", id);
          instance.state.set({
            isEditing: false,
            editingId: null
          });
        }
      }
    });
  },
  "click .discount-codes-grid-row": function (event) {
    // toggle all rows off, then add our active row
    $(".discount-codes-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  }
});

//
// Hooks for update and insert forms
//
AutoForm.hooks({
  "discount-codes-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.settingsSaveSuccess"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.settings.settingsSaveFailure")} ${error}`, "error"
      );
    }
  },
  "discount-codes-insert-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.settingsSaveSuccess"), "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.settings.settingsSaveFailure")} ${error}`, "error"
      );
    }
  }
});
