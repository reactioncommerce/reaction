import _ from "lodash";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Countries } from "/client/collections";
import { Reaction, i18next } from "/client/api";
import { Packages, Logs } from "/lib/collections";
import { Logs as LogSchema } from "/lib/collections/schemas/logs";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";
import LogGriddle from "./avagriddle";
import { Loading } from "/imports/plugins/core/ui/client/components";


function getPackageData() {
  return Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId()
  });
}


Template.avalaraSettings.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Logs", {
      logType: "avalara"
    });
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});

// Avalara supports only Canada and US for address validation
const countryDefaults = ["US", "CA"];

Template.avalaraSettings.helpers({
  packageConfigSchema() {
    return AvalaraPackageConfig;
  },
  packageData() {
    return getPackageData();
  },
  logSchema() {
    return LogSchema;
  },
  logCollection() {
    return Logs;
  },
  countryOptions() {
    return Countries.find({ value: { $in: countryDefaults } }).fetch();
  },
  countryDefaults() {
    return countryDefaults;
  },
  currentCountryList() {
    return AutoForm.getFieldValue("settings.addressValidation.countryList");
  },
  loggingEnabled() {
    const pkgData = getPackageData();
    return pkgData.settings.avalara.enableLogging;
  },

  logGrid() {
    const fields = ["date", "docType"];
    const noDataMessage = i18next.t("logGrid.noLogsFound");
    const instance = Template.instance();

    function editRow(options) {
      const currentId = instance.state.get("editingId");
      instance.state.set("isEditing", options.props.data);
      instance.state.set("editingId", options.props.data._id);
      // toggle edit mode clicking on same row
      if (currentId === options.props.data._id) {
        instance.state.set("isEditing", null);
        instance.state.set("editingId", null);
      }
    }

    // helper adds a class to every grid row
    const customRowMetaData = {
      bodyCssClassName: () =>  {
        return "log-grid-row";
      }
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    fields.forEach(function (field) {
      const columnMeta = {
        columnName: field,
        displayName: i18next.t(`logGrid.columns.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // return template Grid
    return {
      component: LogGriddle,
      publication: "Logs",
      collection: Logs,
      matchingResultsCount: "logs-count",
      useGriddleStyles: false,
      rowMetadata: customRowMetaData,
      columns: fields,
      noDataMessage: noDataMessage,
      onRowClick: editRow,
      columnMetadata: customColumnMetadata,
      externalLoadingComponent: Loading,
      subscriptionParams: { logType: "avalara" }
    };
  },

  instance() {
    const instance = Template.instance();
    return instance;
  },

  logEntry() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const log = Logs.findOne(id) || {};
    log.data = JSON.stringify(log.data, null, 4);
    return log;
  }


});

Template.avalaraSettings.events({
  "click .template-grid-row": function (event) {
    // toggle all rows off, then add our active row
    $(".template-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  },
  "click [data-event-action=testCredentials]": function (event) {
    const formId = "avalara-update-form";
    if (!AutoForm.validateForm(formId)) {
      return null;
    }
    event.preventDefault();
    event.stopPropagation();
    const formData = AutoForm.getFormValues(formId);
    const settings = _.get(formData, "insertDoc.settings.avalara");

    Meteor.call("avalara/testCredentials", settings, function (error, result) {
      if (error && error.message) {
        return Alerts.toast(`${i18next.t("settings.testCredentialsFailed")} ${error.message}`, "error");
      }
      const statusCode = _.get(result, "statusCode");
      const connectionValid = _.inRange(statusCode, 400);
      if (connectionValid) {
        return Alerts.toast(i18next.t("settings.testCredentialsSuccess"), "success");
      }
      return Alerts.toast(i18next.t("settings.testCredentialsFailed"), "error");
    });
  }
});

AutoForm.hooks({
  "avalara-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.taxSettings.shopTaxMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.taxSettings.shopTaxMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
