if (ReactionCore && ReactionCore.Hooks) {
  ReactionCore.Hooks.Events.add("afterCoreInit", () => {
    _.each(ReactionRegistry.Packages, (config, pkgName) => {
      if (config.registry) {
        for (let item of config.registry) {
           // Check container element (section `registry`) with emailTemplate
           // Must not have a route field. Must have a template and container field.
           if (!item.route && item.template &&
                item.container && item.emailTemplates && 
                item.emailTemplates.length > 0) {
              for (const templateId of item.emailTemplates) {
                const path = Npm.require('path');
                const template = Assets.getText(path.join("templates", templateId + ".html"));
                ReactionCore.Log.debug("compile template: " + templateId);
                SSR.compileTemplate(templateId, template);
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
                const path = Npm.require('path');
                const template = Assets.getText(path.join("templates", templateId + ".html"));
                ReactionCore.Log.debug("compile template: " + templateId);
                SSR.compileTemplate(templateId, template);
              }
           }
        }
      }
    });
  });
};
