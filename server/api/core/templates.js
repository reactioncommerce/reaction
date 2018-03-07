import React from "react";
import ReactDOMServer from "react-dom/server";
import Handlebars from "handlebars";
import Immutable from "immutable";
import { Assets, Templates } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

let registeredTemplates = Immutable.OrderedMap();
let templateCache = Immutable.Map();
let templateParsers = Immutable.Map();

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
 * @name getTemplateByName
 * @method
 * @memberof Core
 * @param  {String} templateName Template name
 * @param  {String} shopId       Shop ID
 * @return {Object}              Template object
 */
export function getTemplateByName(templateName, shopId) {
  const registeredTemplate = registeredTemplates.get(shopId)[templateName];

  if (registeredTemplate) {
    return registeredTemplate;
  }

  const templateInfo = Templates.findOne({
    name: templateName,
    $or: [
      // Attempt to find user editable / edited template first
      {
        isOriginalTemplate: false
      },
      // Fallback to the original templates
      {
        isOriginalTemplate: true
      }
    ],
    shopId
  });

  return registerTemplateForMemoryCache(templateInfo);
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

/**
 * @name registerTemplateParser
 * @method
 * @memberof Core
 * @param  {String} name Name of a parser, like React or Handlebars
 * @param  {Function} renderFunction Function
 * @return {null}
 */
export function registerTemplateParser(name, renderFunction) {
  templateParsers = templateParsers.set(name, renderFunction);
}

/**
 * @name renderTemplate
 * @method
 * @memberof Core
 * @param  {Object} templateInfo React or Handlebars
 * @param  {Object} [data={}]    Template data
 * @return {Object|false}        Returns React, Handlebars template or false
 */
export function renderTemplate(templateInfo, data = {}) {
  if (templateInfo.parser === TEMPLATE_PARSER_REACT) {
    return null;
  } else if (templateInfo.parser === TEMPLATE_PARSER_HANDLEBARS) {
    return renderHandlebarsTemplate(templateInfo, data);
  }

  if (typeof templateParsers.get(name) === "function") {
    return templateParsers.get(name)(templateInfo, data);
  }

  return false;
}

/**
 * @name compileHandlebarsTemplate
 * @method
 * @memberof Core
 * @summary Compile and cache Handlebars template
 * @param {String} name Name of template to register amd save to cache
 * @param {String} template markup
 * @return {Function} Compiled handlebars template.
 */
export function compileHandlebarsTemplate(name, template) {
  const compiledTemplate = Handlebars.compile(template);
  templateCache = templateCache.set(name, compiledTemplate);
  return compiledTemplate;
}

/**
 * @name renderHandlebarsTemplate
 * @method
 * @memberof Core
 * @summary Render Handlebars template
 * @param  {String} templateInfo Template info
 * @param  {Object} data         Data
 * @return {Object}              Handlebars template
 */
export function renderHandlebarsTemplate(templateInfo, data) {
  if (templateCache[templateInfo.name] === undefined) {
    compileHandlebarsTemplate(templateInfo.name, templateInfo.template);
  }

  const compiledTemplate = templateCache.get(templateInfo.name);
  return compiledTemplate(data);
}

/**
 * @name renderTemplateToStaticMarkup
 * @method
 * @memberof Core
 * @param  {Object} template React template name
 * @param  {Object} props    React props
 * @return {Object}          Static markup
 */
export function renderTemplateToStaticMarkup(template, props) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(template, props));
}

/**
 * @name resetRegisteredTemplates
 * @method
 * @memberof Core
 * @summary Reset regestered templates. This is mostly useful for aiding in unit testing
 * @return {Immutable.OrderedMap} immultable.js OrderedMap
 */
export function resetRegisteredTemplates() {
  registeredTemplates = Immutable.OrderedMap();
}

/**
 * @name initTemplates
 * @method
 * @memberof Core
 * @summary Hook to setup core Templates imports during Reaction init
 * @return {null}
 */
export function initTemplates() {
  Hooks.Events.add("afterCoreInit", () => {
    Assets.find({ type: "template" }).forEach((t) => {
      Logger.debug(`Importing ${t.name} template`);
      if (t.content) {
        Reaction.Importer.template(JSON.parse(t.content));
      } else {
        Logger.debug(`No template content found for ${t.name} asset`);
      }
    });
    Reaction.Importer.flush();
  });
}

export default {
  get registeredTemplates() {
    return registeredTemplates;
  },
  get templateCache() {
    return templateCache;
  },
  get templateParsers() {
    return templateParsers;
  },
  registerTemplate,
  getTemplateByName,
  processTemplateInfoForDatabase,
  processTemplateInfoForMemoryCache,
  compileHandlebarsTemplate,
  renderHandlebarsTemplate,
  renderTemplateToStaticMarkup
};
