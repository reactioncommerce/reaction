import Immutable from "immutable";
import { Assets } from "/lib/collections";

let registeredTemplates = Immutable.OrderedMap();

export const TEMPLATE_PARSER_REACT = "react";
export const TEMPLATE_PARSER_HANDLEBARS = "handlebars";

/**
 * @name registerTemplate
 * @method
 * @memberof Core
 * @param  {String}  templateInfo              [description]
 * @param  {String}  shopId                    [description]
 * @param  {Boolean} [insertImmediately=false] [description]
 * @return {Object}                            Returns `templateLiteral` and `templateReference`
 */
export function registerTemplate(templateInfo, shopId, insertImmediately = false) {
  const literal = registerTemplateForMemoryCache(templateInfo, shopId);
  const reference = registerTemplateForDatabase(templateInfo, shopId, insertImmediately);

  return {
    templateLiteral: literal,
    templateReference: reference
  };
}

/**
 * @name registerTemplateForMemoryCache
 * @method
 * @memberof Core
 * @summary Process template info and cache in memory.
 * This allows us to have function and class references for the templates for
 * React and other custom parsers
 * @param  {Object} templateInfo Template info with parser info
 * @param  {String} shopId       Shop ID
 * @return {Object}              Template from cache
 */
export function registerTemplateForMemoryCache(templateInfo, shopId) {
  const templateInfoForMemoryCache = processTemplateInfoForMemoryCache(templateInfo);
  let shopTemplates = registeredTemplates.get(shopId);

  if (!shopTemplates) {
    shopTemplates = {};
  }

  shopTemplates[templateInfo.name] = templateInfoForMemoryCache;
  registeredTemplates = registeredTemplates.set(shopId, shopTemplates);

  return templateInfoForMemoryCache;
}

/**
 * @name registerTemplateForDatabase
 * @method
 * @memberof Core
 * @summary Process template info for use in a database
 * Namely, any literals like functions are stripped as they cannot be safely,
 * and should not stored in the database
 * @param  {Object} templateInfo Template info with parser info
 * @return {Object}              Return template data crafted for entry into a database
 */
export function registerTemplateForDatabase(templateInfo) {
  const templateInfoForDatabase = processTemplateInfoForDatabase(templateInfo);

  // Import template into the Assets collecton.
  Assets.update({
    type: "template",
    name: templateInfoForDatabase.name
  }, {
    $set: {
      content: JSON.stringify(templateInfoForDatabase)
    }
  }, {
    upsert: true
  });

  return templateInfoForDatabase;
}

/**
 * @name processTemplateInfoForMemoryCache
 * @method
 * @memberof Core
 * @summary Sets parser to Handlebars for string-based templates and
 * React for functions, objects
 * @param  {Object} templateInfo
 * @param  {String} templateInfo.template Accepted values: `string`, `function`, `object`
 * @return {Boolean|null}              True on success or null
 */
export function processTemplateInfoForMemoryCache(templateInfo) {
  // Avoid mutating the original passed in param
  const info = Immutable.Map(templateInfo);

  if (typeof templateInfo.template === "string") {
    return info.set("parser", TEMPLATE_PARSER_HANDLEBARS).toObject();
  } else if (typeof templateInfo.template === "function") {
    return info.set("parser", TEMPLATE_PARSER_REACT).toObject();
  } else if (typeof templateInfo.template === "object") {
    return info.set("parser", TEMPLATE_PARSER_REACT).toObject();
  }

  return null;
}

/**
 * @name processTemplateInfoForDatabase
 * @method
 * @memberof Core
 * @summary Return `templateData` with `name`, `title`, `type`, `subject`, `templateFor`
 * @param  {Object} templateInfo Object with `templateInfo`
 * @param  {String} templateInfo.template template
 * @param  {String} templateInfo.parser `React` or `Handlebars`
 * @return {Object} templateData
 * @return {String} templateData.name
 * @return {String} templateData.title
 * @return {String} templateData.type
 * @return {String} templateData.subject
 * @return {String} templateData.templateFor
 */
export function processTemplateInfoForDatabase(templateInfo) {
  const templateData = {
    name: templateInfo.name,
    title: templateInfo.title,
    type: templateInfo.type,
    subject: templateInfo.subject,
    templateFor: templateInfo.templateFor
  };


  if (typeof templateInfo.template === "string") {
    templateData.template = templateInfo.template;
    templateData.parser = TEMPLATE_PARSER_HANDLEBARS;
  } else if (typeof templateInfo.template === "object") {
    templateData.template = templateInfo.template;
    templateData.parser = TEMPLATE_PARSER_REACT;
  } else if (typeof templateInfo.template === "function") {
    templateData.parser = TEMPLATE_PARSER_REACT;
  }

  return templateData;
}

export default {
  registerTemplate,
  processTemplateInfoForDatabase,
  processTemplateInfoForMemoryCache
};
