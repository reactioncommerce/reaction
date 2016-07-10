import fs from "fs";
import { Meteor } from "meteor/meteor";
import { Hooks, Logger, Reaction } from "/server/api";

// taken from here: http://stackoverflow.com/a/32749571
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

export function loadCoreTranslations() {
  const meteorPath = fs.realpathSync(process.cwd() + "/../");
  const i18nFolder = `${meteorPath}/server/assets/app/data/i18n/`;

  if (directoryExists(i18nFolder)) {
    fs.readdir(i18nFolder, Meteor.bindEnvironment(function (err, files) {
      if (err) throw new Meteor.Error("No translations found for import.", err);
      for (let file of files) {
        if (~file.indexOf("json")) {
          Logger.debug(`Importing Translations from ${file}`);
          const json = fs.readFileSync(i18nFolder + file, "utf8");
          Reaction.Import.process(json, ["i18n"], Reaction.Import.translation);
        }
      }
    }));
  }
}

export default function () {
  /**
   * Hook to setup core i18n imports during Reaction init
   */
  Hooks.Events.add("onCoreInit", () => {
    loadCoreTranslations();
  });
}
