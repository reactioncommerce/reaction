import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Blaze } from "meteor/blaze";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template } from "meteor/templating";
import { EmailTemplates } from "../../lib/collections/schemas";
import { i18next } from "/client/api";
import { Templates } from "/lib/collections";


/*
 * template templateSettings onCreated
 */
Template.templateSettings.onCreated(function () {
  // Subscribe to Templates collections
  this.autorun(() => {
    this.subscribe("Templates");
  });

  // Initiate State
  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false,
    editingId: null
  });
});


/*
 * template templateSettings helpers
 */
Template.templateSettings.helpers({
  templateGrid() {
    const filteredFields = ["title", "type", "language"];
    const noDataMessage = i18next.t("templateGrid.noTemplatesFound");
    const instance = Template.instance();

    //
    // helper to get and select row from griddle
    // into blaze to get correct template to edit
    //
    function editRow(options) {
      const currentId = instance.state.get("editingId");

      // isEditing is current template
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
        return "template-grid-row";
      }
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach(function (field) {
      const columnMeta = {
        columnName: field,
        displayName: i18next.t(`templateGrid.columns.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    // return template Grid
    return {
      component: MeteorGriddle,
      publication: "Templates",
      collection: Templates,
      matchingResultsCount: "templates-count",
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

  template() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const template = Templates.findOne(id) || {};
    return template;
  },

  typeEmail() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    const template = Templates.findOne(id) || {};
    if (template.type === "email") {
      return true;
    }
    return false;
  },

  emailTemplateSchema() {
    return EmailTemplates;
  }
});


/*
 * template templateSettings events
 */
Template.templateSettings.events({
  "click .template-grid-row": function (event) {
    // toggle all rows off, then add our active row
    $(".template-grid-row").removeClass("active");
    Template.instance().$(event.currentTarget).addClass("active");
  },
  "submit #email-template-edit-form": function () {
    const instance = Template.instance();
    instance.state.set({
      isEditing: false,
      editingId: null
    });
  },
  "click .cancel, .template-grid-row .active": function () {
    instance = Template.instance();
    // remove active rows from grid
    instance.state.set({
      isEditing: false,
      editingId: null
    });
    // ugly hack
    $(".template-grid-row").removeClass("active");
  }
});


AutoForm.hooks({
  "email-template-edit-form": {
    onSubmit: function (insertDoc) {
      this.event.preventDefault();

      const templateId = this.docId;

      Meteor.call("templates/email/update", templateId, insertDoc, (error, result) => {
        if (error) {
          Alerts.toast(i18next.t("templateUpdateForm.alerts.failedToUpdate", { err: error.message }), "error");
          this.done(new Error("Failed to update template: ", error));
          return false;
        }
        if (result) {
          Alerts.toast(i18next.t("templateUpdateForm.alerts.templateUpdated", "Template successfully updated"), "success");
          this.done();
        }
      });
    }
  }
});


Blaze.TemplateInstance.prototype.parentTemplate = function (levels = 1) {
  let view = Blaze.currentView;
  let numLevel = levels;
  while (view) {
    if (view.name.substring(0, 9) === "Template." && !numLevel--) {
      return view.templateInstance();
    }
    view = view.parentView;
  }
};
