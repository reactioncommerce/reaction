import { Meteor } from "meteor/meteor";
import { $ } from "meteor/jquery";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { AutoForm } from "meteor/aldeed:autoform";
import { Shops } from "/lib/collections";
import { Countries } from "/client/collections";
import { Taxes } from "../../lib/collections";
import { i18next } from "/client/api";
import { Taxes as TaxSchema } from "../../lib/collections/schemas";
import { IconButton, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";

/* eslint no-shadow: ["error", { "allow": ["options"] }] */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "[oO]ptions" }] */

Template.customTaxRates.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Taxes");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});

Template.customTaxRates.helpers({
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
        $(".tax-grid-row").removeClass("active");
        return state.set({
          isEditing: !isEditing,
          editingId
        });
      }
    };
  },
  taxGrid() {
    const filteredFields = ["country", "region", "postal", "taxCode", "rate"];
    const noDataMessage = i18next.t("admin.taxSettings.noCustomTaxRatesFound");
    const instance = Template.instance();

    /**
     * @description helper to get and select row from griddle into blaze for to select discount row for editing
     * @param {Object} options row data
     * @returns {undefined}
     */
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
      bodyCssClassName: () => "tax-grid-row"
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.taxGrid.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // return tax Grid
    return {
      component: SortableTable,
      publication: "Taxes",
      collection: Taxes,
      matchingResultsCount: "taxes-count",
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
  taxSchema() {
    return TaxSchema;
  },
  // list of countries for tax input
  countryOptions() {
    return Countries.find().fetch();
  },
  statesForCountry() {
    const shop = Shops.findOne();
    const selectedCountry = AutoForm.getFieldValue("country");
    if (!selectedCountry) {
      return false;
    }
    if ((shop !== null ? shop.locales.countries[selectedCountry].states : undefined) === null) {
      return false;
    }
    const options = [];
    if (shop && typeof shop.locales.countries[selectedCountry].states === "object") {
      for (const state in shop.locales.countries[selectedCountry].states) {
        if ({}.hasOwnProperty.call(shop.locales.countries[selectedCountry].states, state)) {
          const locale = shop.locales.countries[selectedCountry].states[state];
          options.push({
            label: locale.name,
            value: state
          });
        }
      }
    }
    return options;
  },
  taxRate() {
    const shop = Shops.findOne();
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const tax = Taxes.findOne(id) || {};
    // enforce a default country that makes sense.
    if (!tax.country) {
      if (shop && typeof shop.addressBook === "object") {
        tax.country = shop.addressBook[0].country;
      }
    }
    if (!tax.shopId) {
      tax.shopId = shop._id;
    }
    return tax;
  }
});

//
// on submit lets clear the form state
//
Template.customTaxRates.events({
  "submit #customTaxRates-update-form"() {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "submit #customTaxRates-insert-form"() {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .tax-grid-row .active"() {
    const instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".tax-grid-row").removeClass("active");
  },
  "click .delete"() {
    const confirmTitle = i18next.t("admin.taxSettings.confirmRateDelete");
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
          Meteor.call("taxes/deleteRate", id);
          instance.state.set({
            isEditing: false,
            editingId: null
          });
        }
      }
    });
  },
  "click .tax-grid-row"(event) {
    // toggle all rows off, then add our active row
    $(".tax-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  }
});

//
// Hooks for update and insert forms
//
AutoForm.hooks({
  "customTaxRates-update-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.taxSettings.shopCustomTaxRatesSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.taxSettings.shopCustomTaxRatesFailed")} ${error}`, "error");
    }
  },
  "customTaxRates-insert-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.taxSettings.shopCustomTaxRatesSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.taxSettings.shopCustomTaxRatesFailed")} ${error}`, "error");
    }
  }
});
