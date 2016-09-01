import React from "react";
import ReactDOMServer from "react-dom/server";


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


export function renderTemplateToStaticMarkup(template, props) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(template, props)
  );
}
