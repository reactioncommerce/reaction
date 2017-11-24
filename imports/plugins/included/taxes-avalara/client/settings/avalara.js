import { $ } from "meteor/jquery";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Reaction, i18next } from "/client/api";
import { Packages, Logs } from "/lib/collections";
import { Logs as LogSchema } from "/lib/collections/schemas/logs";
import { Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
import { AvalaraSettingsFormContainer } from "../containers";


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


Template.avalaraSettings.helpers({

  /**
  * @method avalaraForm
  * @summary returns a component for updating the TaxCloud settings for
  * this app.
  * @since 1.5.2
  * @return {Object} - an object containing the component to render.
  */
  avalaraSettings() {
    return { component: AvalaraSettingsFormContainer };
  },
  logSchema() {
    return LogSchema;
  },
  logCollection() {
    return Logs;
  },
  loggingEnabled() {
    const pkgData = getPackageData();
    return pkgData.settings.avalara.enableLogging;
  },

  logGrid() {
    const filteredFields = [ "data.request.data.date", "data.request.data.type"];
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
    filteredFields.forEach(function (field) {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`logGrid.columns.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // return template Grid
    return {
      component: SortableTable,
      publication: "Logs",
      collection: Logs,
      matchingResultsCount: "logs-count",
      showFilter: true,
      rowMetadata: customRowMetaData,
      filteredFields: filteredFields,
      columns: filteredFields,
      noDataMessage: noDataMessage,
      onRowClick: editRow,
      columnMetadata: customColumnMetadata,
      externalLoadingComponent: Loading,
      query: { logType: "avalara" }
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
  }
});
