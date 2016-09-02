import React from "react";
import ReactDOMServer from "react-dom/server";
import Handlebars from "handlebars";
import { Reaction } from "./core";


export const TemplateCache = {};
export const TemplateParsers = {};

export function processTemplateInfo(templateInfo) {
  const templateData = {
    name: templateInfo.name,
    title: templateInfo.title,
    type: templateInfo.type
  };

  if (typeof templateInfo.template === "string") {
    templateData.template = templateInfo.template;
    templateData.parser = "handlebars";
  } else if (typeof templateInfo.template === "function") {
    templateData.parser = "react";
  }

  return templateData;
}


export function registerTemplateParser(name, renderFunction) {
  TemplateParsers[name] = renderFunction;
}

export function renderTemplate(templateInfo, data) {
  if (templateInfo.parser === "react") {
    return null;
  } else if (templateInfo.parser === "handlebars") {
    return renderHandlebarsTemplate(templateInfo, data);
  }

  if (typeof TemplateParsers[name] === "function") {
    return TemplateParsers[name](templateInfo, data);
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
  TemplateCache[name] = compiledTemplate;
  return compiledTemplate;
}

export function renderHandlebarsTemplate(templateInfo, data) {
  if (TemplateCache[templateInfo.name] === undefined) {
    compileHandlebarsTemplate(templateInfo.name, templateInfo.template);
  }

  const compiledTemplate = Handlebars.compile(TemplateCache[templateInfo.name]);
  return compiledTemplate(data);
}

export function renderTemplateToStaticMarkup(template, props) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(template, props)
  );
}
