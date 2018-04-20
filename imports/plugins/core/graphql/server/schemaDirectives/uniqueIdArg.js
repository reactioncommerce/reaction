import { defaultFieldResolver, DirectiveLocation, GraphQLDirective, GraphQLNonNull, GraphQLString } from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { decodeOpaqueIdForNamespace } from "@reactioncommerce/reaction-graphql-xforms/id";

class UniqueIdArgDirective extends SchemaDirectiveVisitor {
  // https://www.apollographql.com/docs/graphql-tools/schema-directives.html#Declaring-schema-directives
  static getDirectiveDeclaration(directiveName, schema) {
    const previousDirective = schema.getDirective(directiveName);
    if (previousDirective) return previousDirective;

    return new GraphQLDirective({
      name: directiveName,
      locations: [
        DirectiveLocation.FIELD_DEFINITION
      ],
      args: {
        argument: {
          type: new GraphQLNonNull(GraphQLString)
        },
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
    const { namespace, argument } = this.args;
    field.resolve = async function uniqueIdArgResolve(...args) {
      const params = { ...args[1] };
      if (typeof params[argument] === "string") params[argument] = decodeOpaqueIdForNamespace(namespaces.PREFIX + namespace, params[argument]);
      const newArgs = [args[0], params, args[2], args[3]];
      return resolve.apply(this, newArgs);
    };
  }
}

export default UniqueIdArgDirective;
