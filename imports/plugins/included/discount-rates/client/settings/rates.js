import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { DiscountRates } from "../collections/rates";
import { DiscountRates as DiscountRateSchema } from "../../lib/collections/schemas/rates";
import { i18next } from "/client/api";
import { IconButton, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";

/* eslint no-shadow: ["error", { "allow": ["options"] }] */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "[oO]ptions" }] */

Template.customDiscountRates.onCreated(function () {
  this.autorun(() => {
    this.subscribe("DiscountRates");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});

Template.customDiscountRates.helpers({
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
        $(".discount-rates-grid-row").removeClass("active");
        return state.set({
          isEditing: !isEditing,
          editingId
        });
      }
    };
  },
  discountGrid() {
    const filteredFields = ["label", "discountMethod", "discount"];
    const noDataMessage = i18next.t("admin.settings.noCustomDiscountRatesFound");
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
      bodyCssClassName: () => "discount-rates-grid-row"
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.discountGrid.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // return discount Grid
    return {
      component: SortableTable,
      publication: "DiscountRates",
      collection: DiscountRates,
      matchingResultsCount: "discounts-count",
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
  // schema for forms
  discountRateSchema() {
    return DiscountRateSchema;
  },
  discountRate() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const discount = DiscountRates.findOne(id) || {};
    return discount;
  }
});

//
// on submit lets clear the form state
//
Template.customDiscountRates.events({
  "submit #discount-rates-update-form"() {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "submit #discount-rates-insert-form"() {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .discount-rates-grid-row.active"() {
    const instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".discount-rates-grid-row").removeClass("active");
  },
  "click .delete"() {
    const confirmTitle = i18next.t("admin.settings.confirmRateDelete");
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
          Meteor.call("discounts/deleteRate", id);
          instance.state.set({
            isEditing: false,
            editingId: null
          });
        }
      }
    });
  },
  "click .discount-rates-grid-row"(event) {
    // toggle all rows off, then add our active row
    $(".discount-rates-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  }
});


AutoForm.hooks({
  "discount-rates-update-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.settingsSaveSuccess"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.settings.settingsSaveFailure")} ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  "discount-rates-insert-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.settingsSaveSuccess"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.settings.settingsSaveFailure")} ${error}`, "error");
    }
  }
});
