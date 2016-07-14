import path from "path";
import i18next from "i18next";
import i18nextSprintfPostProcessor from "i18next-sprintf-postprocessor";
import { Hooks, Logger } from "/server/api";
import { fetchTranslationResources } from "/lib/api/i18n";
import { Packages, Templates } from "/lib/collections";


/**
 * Hook to compile email templates at reaction startup time
 */
Hooks.Events.add("afterLoadPackages", () => {
  function getSource(templateId) {
    // using layout where in the future a more comprehensive rule based
    // filter of the email templates can be implemented.
    const exists = Packages.findOne({
      "layout.template": templateId
    });
    if (exists) {
      let lang = "en";
      const shopLocale = Meteor.call("shop/getLocale");

      if (shopLocale && shopLocale.locale && shopLocale.locale.languages) {
        lang = shopLocale.locale.languages;
      }
      tplSource = Templates.findOne({
        template: templateId,
        language: lang
      });
      if (tplSource.source) {
        return tplSource.source;
      }
    }

    return Assets.getText(path.join("email/templates", templateId + ".html"));
  }

  // init i18next for SSR translations
  i18next.
    use(i18nextSprintfPostProcessor).
    init({
      debug: false,
      defaultNS: "core",
      resources: fetchTranslationResources()
    }, (err) => {
      if (err) throw new Meteor.Error("No translations resources found.", err);
      Logger.debug("Finishing loading of server side translations.");
    });

  const packages = Packages.find().fetch();
  _.each(packages, (config) => {
    if (config.registry) {
      for (let item of config.registry) {
        // Check container element (section `registry`) with emailTemplate
        // Must not have a route field. Must have a template and container field.
        if (!item.route && item.template &&
            item.container && item.emailTemplates &&
            item.emailTemplates.length > 0) {
          for (const templateId of item.emailTemplates) {
            Logger.debug("Compile template for container: " + templateId);
            const source = getSource(templateId);
            SSR.compileTemplate(templateId, source);
          }
        }
      }
    }
    if (config.layout) {
      for (let item of config.layout) {
        // Check for workflow step (section `layout`) with emailTemplate
        // Must not have a layout field.
        if (!item.layout && item.emailTemplates && item.emailTemplates.length > 0) {
          for (const templateId of item.emailTemplates) {
            Logger.debug("Compile template for workflow step: " + templateId);
            const source = getSource(templateId);
            SSR.compileTemplate(templateId, source);
          }
        }
      }
    }
  });
});
