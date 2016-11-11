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

/**
 * load a single translation object as an Asset
 * loadTranslation should generally be used
 * before startup, to ensure that Assets load.
 * @param  {Object} source a json i18next object
 * @return {Boolean} false if assets weren't loaded
 */

export function loadTranslation(source) {
  try {
    const content = typeof source === "string" ? JSON.parse(source) : source;
    const json = typeof source === "object" ? JSON.stringify(source) : source;

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

    Logger.debug("Translation assets updated for ", content[0].ns);
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * load an array of translation objects
 * and import using loadTranslation
 * @param  {Object} sources array of i18next translations
 * @return {Boolean} false if assets weren't loaded
 */
export function loadTranslations(sources) {
  sources.forEach(function (source) {
    loadTranslation(source);
  });
}


/**
 * loadCoreTranslations imports i18n json
 * files from private/data/i18n
 * into the Assets collection
 * Assets collection is processed with Reaction.Import
 * after all assets have been loaded.
 */

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

      // purposely broad results here
      // we will be processing assets
      // inserted using loadTranslation
      // as well.
      Assets.find({ type: "i18n" }).forEach((t) => {
        Logger.debug(`Importing ${t.name} translation for \"${t.ns}\"`);
        if (t.content) {
          Reaction.Import.process(t.content, ["i18n"], Reaction.Import.translation);
        } else {
          Logger.debug(`No translation content found for ${t.name} - ${t.ns} asset`);
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
