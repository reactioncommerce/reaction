import fs from "fs";
import { Hooks, Logger, Reaction } from "/server/api";

// taken from here: http://stackoverflow.com/a/32749571
const directoryExists = dirPath => {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
};

const loadCoreTranslations = () => {
  const readFolder = Meteor.wrapAsync(fs.readdir, fs);
  const meteorPath = fs.realpathSync(process.cwd() + "/../");
  // get the list of package folder names which have assets.
  const packagesList = fs.readdirSync(`${meteorPath}/server/assets/packages/`);
  packagesList.forEach(pkg => {
    const i18nFolder = `${meteorPath}/server/assets/packages/${pkg}/private/data/i18n/`;
    // we are avoiding packages w/o correct path
    if (directoryExists(i18nFolder)) {
      readFolder(i18nFolder, function (err, files) {
        if (err) throw new Meteor.Error("No translations found for import.", err);
        for (let file of files) {
          if (file.indexOf("json")) {
            Logger.debug(`Importing Translations from ${file}`);
            let json = fs.readFileSync(i18nFolder + file, "utf8");
            Reaction.Import.process(json, ["i18n"], Reaction.Import.translation);
          }
        }
      });
    }
  });
};

export default function () {
  /**
   * Hook to setup core i18n imports during ReactionCore init
   */
  Hooks.Events.add("onCoreInit", () => {
    loadCoreTranslations();
  });
}
