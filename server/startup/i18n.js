import fsModule from "fs";
import path from "path";
import util from "util";
import { Assets, Translations } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

const fs = {
  readdir: util.promisify(fsModule.readdir),
  readFile: util.promisify(fsModule.readFile),
  realpath: util.promisify(fsModule.realpath),
  stat: util.promisify(fsModule.stat)
};

const translationSources = [];
const rawAssetsCollection = Assets.rawCollection();
let bulkAssetOp;

async function directoryExists(dirPath) {
  let info;

  try {
    info = await fs.stat(dirPath);
  } catch (error) {
    return false;
  }

  return info.isDirectory();
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
    if (!bulkAssetOp) bulkAssetOp = rawAssetsCollection.initializeUnorderedBulkOp();
    const content = typeof source === "string" ? JSON.parse(source) : source;
    const json = typeof source === "object" ? JSON.stringify(source) : source;
    const { i18n, ns } = content[0];

    // Keep a record of all available translations for import later at a later time if using the
    // reload translations icon button from the Internationalization settings panel
    translationSources.push(source);

    bulkAssetOp
      .find({ type: "i18n", name: i18n, ns })
      .upsert()
      .update({ $set: { content: json } });

    Logger.debug("Translation assets bulk update prepared for ", ns);
  } catch (error) {
    Logger.error("Failed to prepare bulk upsert for translation assets", error);
  }
}

/**
 * load an array of translation objects
 * and import using loadTranslation
 * @param  {Object} sources array of i18next translations
 * @return {Boolean} false if assets weren't loaded
 */
export function loadTranslations(sources) {
  sources.forEach(loadTranslation);
}

export async function flushTranslationLoad() {
  if (!bulkAssetOp) return Promise.resolve();

  try {
    await bulkAssetOp.execute();
    bulkAssetOp = null;
  } catch (error) {
    Logger.error("Error flushing the translation asset upserts");
  }
}

/**
 * loadCoreTranslations imports i18n json
 * files from private/data/i18n
 * into the Assets collection
 * Assets collection is processed with Reaction.Importer
 * after all assets have been loaded.
 */

export async function loadCoreTranslations() {
  const meteorPath = await fs.realpath(`${process.cwd()}/../`);
  const i18nFolder = `${meteorPath}/server/assets/app/data/i18n/`;

  if (await directoryExists(i18nFolder)) {
    let files;
    try {
      files = await fs.readdir(i18nFolder);
    } catch (error) {
      throw new Error(`No translations found in ${i18nFolder} for import`, error);
    }

    const promises = files.filter((file) => file.endsWith(".json")).map((file) => {
      Logger.debug(`Importing Translations from ${file}`);
      return fs.readFile(path.join(i18nFolder, file), "utf8");
    });

    let fileContents = [];
    try {
      fileContents = await Promise.all(promises);
    } catch (error) {
      Logger.error("Failed to load translations from files", error.message);
    }

    fileContents.forEach(loadTranslation);
  }
}

/**
 * Reload translations for all shops
 * @return {undefined}
*/
export function reloadAllTranslations() {
  // Clear assets for i18n
  Assets.remove({ type: "i18n" });

  // Remove translations for all shops
  Translations.remove();

  // Load translations from translation sources and prepare bulk op
  loadTranslations(translationSources);

  // Load translations
  importAllTranslations();
}

/**
 * Reload translations for specified shop
 * @param {string} shopId - Shop Id to reset translations for
 * @return {undefined}
*/
export function reloadTranslationsForShop(shopId) {
  // Clear assets for i18n
  Assets.remove({ type: "i18n" });

  // Remove translations for the current shop
  Translations.remove({ shopId });

  // Load translations from translation sources and prepare bulk op
  loadTranslations(translationSources);

  // Load translations
  importAllTranslations();
}

export function importAllTranslations() {
  // Get count of all i18n assets
  const i18nAssetCount = Assets.find({ type: "i18n" }).count();

  // If we have no assets, then this is either a fresh start or
  // the i18n assets were cleared. In either case, allow i18n translations
  // to be loaded into Assets collection and subsequently into the Translation collection
  if (i18nAssetCount === 0) {
    // Import core translations
    Promise.await(loadCoreTranslations());

    // Flush all the bulk Assets upserts created by calls to loadTranslations
    Promise.await(flushTranslationLoad());

    Logger.debug("All translation assets updated");

    // Then loop through those I18N assets and import them
    Assets.find({ type: "i18n" }).forEach((t) => {
      Logger.debug(`Importing ${t.name} translation for "${t.ns}"`);
      if (t.content) {
        Reaction.Importer.process(t.content, ["i18n"], Reaction.Importer.translation);
      } else {
        Logger.debug(`No translation content found for ${t.name} - ${t.ns} asset`);
      }
    });
    Reaction.Importer.flush();

    Logger.debug("All translation imported into translations collection from Assets.");
  } else {
    bulkAssetOp = null;
    Logger.debug("Cancel translation update. Translations have a already been imported.");
  }
}
