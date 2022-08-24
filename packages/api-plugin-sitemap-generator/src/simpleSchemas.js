import SimpleSchema from "simpl-schema";

/**
 * @name Sitemap
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} _id of sitemap
 * @property {Date} createdAt date at which this sitemap was created
 * @property {String} handle the name of the sitemap xml file
 * @property {String} shopId the shop to which this sitemap belongs to.
 * @property {String} xml the sitemap in XML format
 */
export const Sitemap = new SimpleSchema({
  _id: String,
  createdAt: Date,
  handle: {
    type: String
  },
  shopId: {
    type: String
  },
  xml: {
    type: String
  }
});
