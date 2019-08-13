import { Meteor } from "meteor/meteor";

/**
 * @name getTagSuggestions
 * @summary Returns tags matching the given term
 * @param {String} term search query
 * @param {Object} options options
 * @param {Array} [options.excludeTags] array of tag ids (String) to exclude
 * @returns {Promise<Array>} matching tags
 */
export default async function getTagSuggestions(term, { excludeTags }) {
  try {
    return new Promise((resolve, reject) => {
      Meteor.call("tags/getBySlug", term, excludeTags, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    return [];
  }
}
