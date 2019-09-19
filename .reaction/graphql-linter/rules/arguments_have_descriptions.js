"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgumentsHaveDescriptions = ArgumentsHaveDescriptions;

var _validation_error = require("graphql-schema-linter/lib/validation_error");

function ArgumentsHaveDescriptions(context) {
  return {
    FieldDefinition: function FieldDefinition(node) {
      for (const arg of node.arguments || []) {
        if (!arg.description || typeof arg.description.value !== "string" || arg.description.value.length === 0) {
          context.reportError(new _validation_error.ValidationError("arguments-have-descriptions", "Every argument must have a description", [arg]));
        }
      }
    }
  };
}
