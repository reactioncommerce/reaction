"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputObjectFieldsSortedAlphabetically = InputObjectFieldsSortedAlphabetically;

var _validation_error = require("graphql-schema-linter/lib/validation_error");
const { listIsAlphabetical } = require("../util/listIsAlphabetical");

function InputObjectFieldsSortedAlphabetically(context) {
  return {
    InputObjectTypeDefinition: function InputObjectTypeDefinition(node) {
      const fieldList = (node.fields || []).map((field) => field.name.value);
      const sortedFieldList = listIsAlphabetical(fieldList);

      if (sortedFieldList !== true) {
        context.reportError(
          new _validation_error.ValidationError(
            "input-object-fields-sorted-alphabetically",
            "The fields of input type `" +
              node.name.value +
              "` must be sorted alphabetically." +
              " Expected sorting: " +
              sortedFieldList.join(", "),
            [node]
          )
        );
      }
    }
  };
}
