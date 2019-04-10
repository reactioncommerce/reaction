"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeFieldsSortedAlphabetically = TypeFieldsSortedAlphabetically;

var _validation_error = require("graphql-schema-linter/lib/validation_error");
const { listIsAlphabetical } = require("../util/listIsAlphabetical");

function TypeFieldsSortedAlphabetically(context) {
  return {
    ObjectTypeDefinition: function ObjectTypeDefinition(node) {
      const fieldList = (node.fields || []).map((field) => field.name.value);
      const { isSorted, sortedList } = listIsAlphabetical(fieldList);

      if (!isSorted) {
        context.reportError(
          new _validation_error.ValidationError(
            "type-fields-sorted-alphabetically",
            "The fields of object type `" +
              node.name.value +
              "` must be sorted alphabetically." +
              " Expected sorting: " +
              sortedList.join(", "),
            [node]
          )
        );
      }
    }
  };
}


