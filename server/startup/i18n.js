import fsModule from "fs";
import path from "path";
import util from "util";
import { Assets } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

const fs = {
  readdir: util.promisify(fsModule.readdir),
  readFile: util.promisify(fsModule.readFile),
  realpath: util.promisify(fsModule.realpath),
  stat: util.promisify(fsModule.stat)
};

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

    bulkAssetOp
      .find({ type: "i18n", name: i18n, ns })
      .upsert()
      .update({ $set: { content: json } });

    Logger.debug("Translation assets updated for ", ns);
  } catch (error) {
    Logger.error("Failed to upsert translation asset", error);
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

export function importAllTranslations() {
  Promise.await(loadCoreTranslations());

  // Flush all the bulk Assets upserts created by calls to loadTranslations
  Promise.await(flushTranslationLoad());

  // Then loop through those I18N assets and import them
  Assets.find({ type: "i18n" }).forEach((t) => {
    Logger.debug(`Importing ${t.name} translation for \"${t.ns}\"`);
    if (t.content) {
      Reaction.Importer.process(t.content, ["i18n"], Reaction.Importer.translation);
    } else {
      Logger.debug(`No translation content found for ${t.name} - ${t.ns} asset`);
    }
  });
  Reaction.Importer.flush();
}
