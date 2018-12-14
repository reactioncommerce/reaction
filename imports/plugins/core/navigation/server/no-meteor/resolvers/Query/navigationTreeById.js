import SimpleSchema from "simpl-schema";
import { decodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";

const argsSchema = new SimpleSchema({
  id: {
    type: String
  },
  language: {
    type: String
  }
});

/**
 * @name Query.navigationTreeById
 * @method
 * @memberof Navigation/GraphQL
 * @summary Returns a navigation tree by its ID in the specified language
 * @param {Object} _ unused
 * @param {ConnectionArgs} args An object of all arguments that were sent by the client
 * @param {String} args.id The ID of the navigation tree
 * @param {String} args.language The language to load items in
 * @param {Object} context An object containing the per-request state
 * @return {Promise<Object>} A NavigationTree object
 */
export default async function navigationTreeById(_, args, context) {
  const { id, language } = args;

  argsSchema.validate({ id, language });

  const decodedId = decodeNavigationTreeOpaqueId(id);

  return context.queries.navigationTreeById(context, language, decodedId);
}
