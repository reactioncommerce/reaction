import fs from "fs";
import { Meteor } from "meteor/meteor";
import { Assets } from "/lib/collections";
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
      for (const file of files) {
        if (~file.indexOf("json")) {
          Logger.debug(`Importing Translations from ${file}`);
          const json = fs.readFileSync(i18nFolder + file, "utf8");
          const content = JSON.parse(json);

          Assets.update({
            type: "i18n",
            name: content[0].i18n,
            ns: content[0].ns
          }, {
            $set: {
              content: json
            }
          }, {
            upsert: true
          });
        }
      }

      Assets.find({ type: "i18n" }).forEach((t) => {
        Logger.debug(`Importing ${t.name} translation for \"${t.ns}\"`);
        if (t.content) {
          Reaction.Import.process(t.content, ["i18n"], Reaction.Import.translation);
        } else {
          Logger.warn(`No translation content found for ${t.name} - ${t.ns} asset`);
        }
      });
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
