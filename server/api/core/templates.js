import React from "react";
import ReactDOMServer from "react-dom/server";
import Handlebars from "handlebars";
import Immutable from "immutable";
import { Import } from "./import";
import { Templates } from "/lib/collections";

let registeredTemplates = Immutable.OrderedMap();
let templateCache = Immutable.Map();
let templateParsers = Immutable.Map();

// var ReactComponentPrototype = React.Component.prototype
// var ReactClassComponentPrototype = (Object.getPrototypeOf(Object.getPrototypeOf(new (React.createClass({ render () {} }))())))

export const TEMPLATE_PARSER_REACT = "react";
export const TEMPLATE_PARSER_HANDLEBARS = "handlebars";

export function registerTemplate(templateInfo, shopId, insertImmediately = false) {
  const literal = registerTemplateForMemoryCache(templateInfo, shopId);
  const reference = registerTemplateForDatabase(templateInfo, shopId, insertImmediately);

  return {
    templateLiteral: literal,
    templateReference: reference
  };
}

export function registerTemplateForMemoryCache(templateInfo, shopId) {
  // Process template info and cache in memory.
  // This allows us to have function and class references for the templates for
  // React and other custom parsers
  const templateInfoForMemoryCache = processTemplateInfoForMemoryCache(templateInfo);


  let shopTemplates = registeredTemplates.get(shopId);

  if (!shopTemplates) {
    shopTemplates = {};
  }

  shopTemplates[templateInfo.name] = templateInfoForMemoryCache;
  registeredTemplates = registeredTemplates.set(shopId, shopTemplates);

  return templateInfoForMemoryCache;
}

export function registerTemplateForDatabase(templateInfo, shopId, insertImmediately = false) {
  // Process template info for use in a database
  // Namely, any literals like functions are stripped as they cannot be safetly,
  // and should not stored in the database
  const templateInfoForDatabase = processTemplateInfoForDatabase(templateInfo);

  // Import the template, but marke it as original so it sould not be edited
  // This way, the shop admins will always be able to revert to default,
  // and it makes logic in the front end a little easier
  Import.template({
    ...templateInfoForDatabase,
    isOriginalTemplate: true
  }, shopId);

  const foundTemplate = Templates.findOne({
    name: templateInfoForDatabase.name,
    isOriginalTemplate: false,
    shopId: shopId
  });

  // Import a duplicate that is meant to be user editable, but only once if it
  // does't exist.
  if (!foundTemplate) {
    Import.template(templateInfoForDatabase, shopId);
  }

  if (insertImmediately) {
    Import.flush();
  }

  // Return template data crafted for entry into a database
  return templateInfoForDatabase;
}

export function getTemplateByName(templateName, shopId) {
  const registeredTemplate = registeredTemplates.get(shopId)[templateName];

  if (registeredTemplate) {
    return registeredTemplate;
  }

  const templateInfo = Templates.findOne({
    name: templateName,
    $or: [
      // Attemt to find user editable / edited templated first
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

export function processTemplateInfoForMemoryCache(templateInfo) {
  // Avoid mutating the original passed in param
  const info = Immutable.Map(templateInfo);

  if (typeof templateInfo.template === "string") {
    // Set the template parser to Handlebars for string based templates
    return info.set("parser", TEMPLATE_PARSER_HANDLEBARS).toObject();
  } else if (typeof templateInfo.template === "function") {
    // Set the parser to react for React components
    return info.set("parser", TEMPLATE_PARSER_REACT).toObject();
  } else if (typeof templateInfo.template === "object") {
    // Set the parser to react for React components
    return info.set("parser", TEMPLATE_PARSER_REACT).toObject();
  }

  return null;
}

export function processTemplateInfoForDatabase(templateInfo) {
  const templateData = {
    name: templateInfo.name,
    title: templateInfo.title,
    type: templateInfo.type,
    subject: templateInfo.subject
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


export function registerTemplateParser(name, renderFunction) {
  templateParsers = templateParsers.set(name, renderFunction);
}

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
 * Compile and cache Handlebars template
 * @param {String} name Name of template to register amd save to cache
 * @param {String} template markup
 * @return {Function} Compiled handlebars template.
 */
export function compileHandlebarsTemplate(name, template) {
  const compiledTemplate = Handlebars.compile(template);
  templateCache = templateCache.set(name, compiledTemplate);
  return compiledTemplate;
}

export function renderHandlebarsTemplate(templateInfo, data) {
  if (templateCache[templateInfo.name] === undefined) {
    compileHandlebarsTemplate(templateInfo.name, templateInfo.template);
  }

  const compiledTemplate = templateCache.get(templateInfo.name);
  return compiledTemplate(data);
}

export function renderTemplateToStaticMarkup(template, props) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(template, props)
  );
}

/**
 * Reset regestered templates
 * This is mostly useful for aiding in unit testing
 * @return {Immutable.OrderedMap} immultable.js OrderedMap
 */
export function resetRegisteredTemplates() {
  registeredTemplates = Immutable.OrderedMap();
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
