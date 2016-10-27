import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { AutoForm } from "meteor/aldeed:autoform";
import { Shops } from "/lib/collections";
import { Countries } from "/client/collections";
import { Discounts} from "/imports/plugins/core/discounts/lib/collections";
import { DiscountCodes } from "../../lib/collections";
import { i18next } from "/client/api";
import { Discounts as DiscountSchema } from "../../lib/collections/schemas";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { IconButton } from "/imports/plugins/core/ui/client/components";

/* eslint no-shadow: ["error", { "allow": ["options"] }] */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "[oO]ptions" }] */

Template.customDiscountCodes.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Discounts");
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
        $(".discount-grid-row").removeClass("active");
        return state.set({
          isEditing: !isEditing,
          editingId: editingId
        });
      }
    };
  },
  discountGrid() {
    const filteredFields = ["discountCode", "rate", "country", "region", "postal"];
    const noDataMessage = i18next.t("discountSettings.noCustomDiscountRatesFound");
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
        return "discount-grid-row";
      }
    };

    // return discount Grid
    return {
      component: MeteorGriddle,
      publication: "Discounts",
      collection: Discounts,
      matchingResultsCount: "discounts-count",
      showFilter: true,
      useGriddleStyles: false,
      rowMetadata: customRowMetaData,
      filteredFields: filteredFields,
      columns: filteredFields,
      noDataMessage: noDataMessage,
      onRowClick: editRow
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
  // list of countries for discount input
  countryOptions: function () {
    return Countries.find().fetch();
  },
  statesForCountry: function () {
    const shop = Shops.findOne();
    const selectedCountry = AutoForm.getFieldValue("country");
    if (!selectedCountry) {
      return false;
    }
    if ((shop !== null ? shop.locales.countries[selectedCountry].states : void 0) === null) {
      return false;
    }
    options = [];
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
  discountRate() {
    const shop = Shops.findOne();
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const discount = Discounts.findOne(id) || {};
    // enforce a default country that makes sense.
    if (!discount.country) {
      if (shop && typeof shop.addressBook === "object") {
        discount.country = shop.addressBook[0].country;
      }
    }
    return discount;
  },
  discountCodes() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const discountCodes = DiscountCodes.find().fetch();
      const options = [{
        label: i18next.t("discountSettings.discountable"),
        value: true
      }, {
        label: i18next.t("discountSettings.notdiscountable"),
        value: false
      }];

      for (const discountCode of discountCodes) {
        options.push({
          label: i18next.t(discountCode.label),
          value: discountCode.id
        });
      }
      return options;
    }
    return [];
  }
});

//
// on submit lets clear the form state
//
Template.customDiscountCodes.events({
  "submit #customDiscountCodes-update-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "submit #customDiscountCodes-insert-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: true,
      editingId: null
    });
  },
  "click .cancel, .discount-grid-row .active": function () {
    instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".discount-grid-row").removeClass("active");
  },
  "click .delete": function () {
    const confirmTitle = i18next.t("discountSettings.confirmRateDelete");
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
  "click .discount-grid-row": function (event) {
    // toggle all rows off, then add our active row
    $(".discount-grid-row").removeClass("active");
    $(event.currentTarget).addClass("active");
  }
});

//
// Hooks for update and insert forms
//
AutoForm.hooks({
  "customDiscountCodes-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("discountSettings.shopCustomDiscountRatesSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("discountSettings.shopCustomDiscountRatesFailed")} ${error}`, "error"
      );
    }
  },
  "customDiscountCodes-insert-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("discountSettings.shopCustomDiscountRatesSaved"), "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("discountSettings.shopCustomDiscountRatesFailed")} ${error}`, "error"
      );
    }
  }
});
