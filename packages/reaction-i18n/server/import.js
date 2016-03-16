loadCoreTranslations = () => {
  const fs = Npm.require("fs");
  const packageName = "reactioncommerce_reaction-i18n";
  const readFolder = Meteor.wrapAsync(fs.readdir, fs);
  const meteorPath = fs.realpathSync(process.cwd() + "/../");
  const i18nFolder = `${meteorPath}/server/assets/packages/${packageName}/private/data/i18n/`;
  readFolder(i18nFolder, function (err, files) {
    if (err) throw new Meteor.Error("No translations found for import.", err);
    for (const file of files) {
      if (file.indexOf("json")) {
        ReactionCore.Log.debug(`Importing Translations from ${file}`);
        const json = Assets.getText("private/data/i18n/" + file);
        ReactionImport.process(json, ["i18n"], ReactionImport.translation);
      }
    }
  });
};

/**
 * Hook to setup core i18n imports during ReactionCore init
 */
if (ReactionCore && ReactionCore.Hooks) {
  ReactionCore.Hooks.Events.add("onCoreInit", () => {
    loadCoreTranslations();
  });
}
