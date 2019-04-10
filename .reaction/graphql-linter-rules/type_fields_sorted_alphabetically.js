'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeFieldsSortedAlphabetically = TypeFieldsSortedAlphabetically;

var _validation_error = require('graphql-schema-linter/lib/validation_error');

function TypeFieldsSortedAlphabetically(context) {
  return {
    ObjectTypeDefinition: function ObjectTypeDefinition(node) {
      const fieldList = (node.fields || []).map((field) => field.name.value);
      const sortedFieldList = fieldList.slice().sort();

      if (!arraysEqual(fieldList, sortedFieldList)) {
        context.reportError(
          new _validation_error.ValidationError(
            'type-fields-sorted-alphabetically',
            'The fields of object type `' +
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
