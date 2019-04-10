/**
 * This file is copied from https://github.com/cjoudrey/graphql-schema-linter/blob/master/src/rules/relay_connection_arguments_spec.js
 *
 * The only change we've made is to allow either ConnectionLimitInt or Int.
 * ConnectionLimitInt is our own version of Int that adjusts the provided
 * number to be greater than 0 or less than some max number if it isn't.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelayConnectionArgumentsSpecCustom = RelayConnectionArgumentsSpecCustom;

var _validation_error = require('graphql-schema-linter/lib/validation_error');

function unwrapType(type) {
  if (type.kind == 'NonNullType') {
    return type.type;
  } else {
    return type;
  }
}

function RelayConnectionArgumentsSpecCustom(context) {
  return {
    FieldDefinition: function FieldDefinition(node) {
      var fieldType = unwrapType(node.type);
      if (fieldType.kind != 'NamedType' || !fieldType.name.value.endsWith('Connection')) {
        return;
      }

      var firstArgument = node.arguments.find(function (argument) {
        return argument.name.value == 'first';
      });
      var afterArgument = node.arguments.find(function (argument) {
        return argument.name.value == 'after';
      });
      var hasForwardPagination = firstArgument && afterArgument;

      var lastArgument = node.arguments.find(function (argument) {
        return argument.name.value == 'last';
      });
      var beforeArgument = node.arguments.find(function (argument) {
        return argument.name.value == 'before';
      });
      var hasBackwardPagination = lastArgument && beforeArgument;

      if (!hasForwardPagination && !hasBackwardPagination) {
        return context.reportError(new _validation_error.ValidationError('relay-connection-arguments-spec-custom', 'A field that returns a Connection Type must include forward pagination arguments (`first` and `after`), backward pagination arguments (`last` and `before`), or both as per the Relay spec.', [node]));
      }

      if (firstArgument) {
        if (firstArgument.type.kind != 'NamedType' || (firstArgument.type.name.value != 'Int' && firstArgument.type.name.value != 'ConnectionLimitInt')) {
          return context.reportError(new _validation_error.ValidationError('relay-connection-arguments-spec-custom', 'Fields that support forward pagination must include a `first` argument that takes a non-negative integer as per the Relay spec.', [firstArgument]));
        }
      }

      if (lastArgument) {
        if (lastArgument.type.kind != 'NamedType' || (lastArgument.type.name.value != 'Int' && lastArgument.type.name.value != 'ConnectionLimitInt')) {
          return context.reportError(new _validation_error.ValidationError('relay-connection-arguments-spec-custom', 'Fields that support forward pagination must include a `last` argument that takes a non-negative integer as per the Relay spec.', [lastArgument]));
        }
      }
    }
  };
}
