function getSource(templateId) {
  // using layout where in the future a more comprehensive rule based
  // filter of the email templates can be implemented.
  const exists = ReactionCore.Collections.Packages.findOne({
    "layout.template": templateId
  });
  if (exists) {
    let lang = "en";
    const shopLocale = Meteor.call("shop/getLocale");

    if (shopLocale && shopLocale.locale && shopLocale.locale.languages) {
      lang = shopLocale.locale.languages;
    }
    tplSource = ReactionCore.Collections.Templates.findOne({
      template: templateId,
      language: lang
    });
    if (tplSource.source) {
      return tplSource.source;
    }
  }

  const path = Npm.require("path");
  return Assets.getText(path.join("templates", templateId + ".html"));
}

if (ReactionCore && ReactionCore.Hooks) {
  ReactionCore.Hooks.Events.add("afterCoreInit", () => {
    _.each(ReactionRegistry.Packages, (config) => {
      if (config.registry) {
        for (let item of config.registry) {
          // Check container element (section `registry`) with emailTemplate
          // Must not have a route field. Must have a template and container field.
          if (!item.route && item.template &&
              item.container && item.emailTemplates &&
              item.emailTemplates.length > 0) {
            for (const templateId of item.emailTemplates) {
              ReactionCore.Log.debug("compile template: " + templateId);
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
              ReactionCore.Log.debug("compile template: " + templateId);
              const source = getSource(templateId);
              SSR.compileTemplate(templateId, source);
            }
          }
        }
      }
    });
  });
}
