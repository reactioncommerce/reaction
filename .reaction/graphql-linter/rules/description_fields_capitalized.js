"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DescriptionsAreCapitalized = DescriptionsAreCapitalized;

var _validation_error = require("graphql-schema-linter/lib/validation_error");
var schema = require('graphql/utilities/buildASTSchema');

function DescriptionsAreCapitalized(configuration, context) {
  return {
    FieldDefinition(node, key, parent, path, ancestors) {
      var description = schema.getDescription(node, {
        commentDescriptions: configuration.getCommentDescriptions(),
      })
      if (description && description[0] === description[0].toUpperCase()) {
        return;
      }

      const fieldName = node.name.value;
      const parentName = ancestors[ancestors.length - 1].name.value;

      context.reportError(
        new _validation_error.ValidationError(
          'descriptions-are-capitalized',
          `The description for field \`${parentName}.${fieldName}\` should be capitalized.`,
          [node]
        )
      );
    },
  };
}
