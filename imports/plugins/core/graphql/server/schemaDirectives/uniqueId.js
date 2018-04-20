import { defaultFieldResolver, DirectiveLocation, GraphQLDirective, GraphQLNonNull, GraphQLString } from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { decodeOpaqueIdForNamespace, encodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

class UniqueIdDirective extends SchemaDirectiveVisitor {
  // https://www.apollographql.com/docs/graphql-tools/schema-directives.html#Declaring-schema-directives
  static getDirectiveDeclaration(directiveName, schema) {
    const previousDirective = schema.getDirective(directiveName);
    if (previousDirective) return previousDirective;

    return new GraphQLDirective({
      name: directiveName,
      locations: [
        DirectiveLocation.FIELD_DEFINITION,
        DirectiveLocation.INPUT_FIELD_DEFINITION
      ],
      args: {
        namespace: {
          type: new GraphQLNonNull(GraphQLString)
        }
      }
    });
  }

  /**
   * @name visitFieldDefinition
   * @summary Given an "ID" type field, transforms the resolved string to be globally unique
   * @param {GraphQLField} field Any GraphQL field on which the schema author has used this directive
   * @returns Globally unique string, with the `namespace` argument value encoded into it
   */
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { namespace } = this.args;
    field.resolve = async function uniqueIdResolve(...args) {
      const result = await resolve.apply(this, args);
      return encodeOpaqueId(namespaces.PREFIX + namespace, result);
    };
  }

  /**
   * @name visitInputFieldDefinition
   * @summary Given an "ID" type input field, transforms the globally unique input ID to be an internal ID.
   *   Also verifies that the encoded namespace matches the expected namespace using the `namespace` argument.
   * @param {GraphQLField} field Any GraphQL input field on which the schema author has used this directive
   * @returns Decoded internal ID
   */
  visitInputFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { namespace } = this.args;
    field.resolve = async function uniqueIdResolve(...args) {
      const result = await resolve.apply(this, args);
      return decodeOpaqueIdForNamespace(namespaces.PREFIX + namespace, result);
    };
  }
}

export default UniqueIdDirective;
