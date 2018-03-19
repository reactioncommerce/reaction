/* eslint prefer-arrow-callback:0 */
import React from "react";
import { expect } from "meteor/practicalmeteor:chai";
import Reaction from "./";
import {
  registerTemplate,
  getTemplateByName,
  renderTemplate,
  resetRegisteredTemplates,
  processTemplateInfoForMemoryCache,
  TEMPLATE_PARSER_REACT,
  TEMPLATE_PARSER_HANDLEBARS
} from "./templates";
import { Templates } from "/lib/collections";


function sampleReactComponent() {
  return (
    <div>{"Test"}</div>
  );
}

describe("Templates:", function () {
  beforeEach(function () {
    Templates.remove();
    resetRegisteredTemplates();
  });

  it("It should process a handlebars template for memory cache", function () {
    const expectedTemplate = processTemplateInfoForMemoryCache({
      name: "test-template",
      template: "<div>Test</div>"
    });

    expect(expectedTemplate.name).to.be.equal("test-template");
    expect(expectedTemplate.parser).to.be.equal(TEMPLATE_PARSER_HANDLEBARS);
  });

  it("It should process a react component for memory cache", function () {
    const expectedTemplate = processTemplateInfoForMemoryCache({
      name: "test-template",
      template: sampleReactComponent
    });

    expect(expectedTemplate.name).to.be.equal("test-template");
    expect(expectedTemplate.parser).to.be.equal(TEMPLATE_PARSER_REACT);
    expect(expectedTemplate.template).to.be.a("function");
  });

  it("It should register Handlebars template", function () {
    const shopId = Reaction.getShopId();
    // Register template
    const sampleTemplate = {
      name: "test-template",
      template: "<div>Test</div>",
      type: "template"
    };
    registerTemplate(sampleTemplate, shopId);

    const actualTemplate = getTemplateByName("test-template", shopId);
    expect(sampleTemplate.name).to.be.equal(actualTemplate.name);
    expect(actualTemplate.parser).to.be.equal(TEMPLATE_PARSER_HANDLEBARS);
  });

  it("It should register Handlebars template and render to a string", function () {
    const shopId = Reaction.getShopId();
    // Register template
    const sampleTemplate = {
      name: "test-template",
      template: "<div>Test</div>",
      type: "template"
    };

    registerTemplate(sampleTemplate, shopId);

    const actualTemplate = getTemplateByName("test-template", shopId);
    expect(sampleTemplate.name).to.be.equal(actualTemplate.name);
    expect(actualTemplate.parser).to.be.equal(TEMPLATE_PARSER_HANDLEBARS);

    // Compile template to string
    const renderedHtmlString = renderTemplate(actualTemplate);
    expect(renderedHtmlString).to.be.a("string");
  });

  it("It should register a React component", function () {
    const shopId = Reaction.getShopId();
    const sampleTemplate = {
      name: "test-template-react",
      template: sampleReactComponent,
      type: "template"
    };

    registerTemplate(sampleTemplate, shopId);

    const actualTemplate = getTemplateByName("test-template-react", shopId);

    expect(sampleTemplate.name).to.be.equal(actualTemplate.name);
    expect(actualTemplate.parser).to.be.equal(TEMPLATE_PARSER_REACT);
    expect(actualTemplate.template).to.be.a("function");
  });
});
