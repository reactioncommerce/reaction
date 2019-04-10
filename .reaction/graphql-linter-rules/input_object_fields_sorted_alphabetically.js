'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputObjectFieldsSortedAlphabetically = InputObjectFieldsSortedAlphabetically;

var _validation_error = require('graphql-schema-linter/lib/validation_error');

function InputObjectFieldsSortedAlphabetically(context) {
  return {
    InputObjectTypeDefinition: function InputObjectTypeDefinition(node) {
      const fieldList = (node.fields || []).map((field) => field.name.value);
      const sortedFieldList = fieldList.slice().sort();

      if (!arraysEqual(fieldList, sortedFieldList)) {
        context.reportError(
          new _validation_error.ValidationError(
            'input-object-fields-sorted-alphabetically',
            'The fields of input type `' +
              node.name.value +
              '` must be sorted alphabetically.' +
              ' Expected sorting: ' +
              sortedFieldList.join(', '),
            [node]
          )
        );
      }
    }
  };
}

function arraysEqual(a, b) {
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
