/**
 * @name Product/socialMetadata
 * @method
 * @memberof Product/GraphQL
 * @summary Combines all social data for a product into single array
 * @param {Object} product - Product response from parent resolver
 * @returns {Object[]}  array of social media objects
 */
export default async function tags(product) {
  const { facebookMsg = "", googleplusMsg = "", pinterestMsg = "", twitterMsg = "" } = product;

  const socialMediaMessages = [
    {
      message: facebookMsg,
      service: "facebook"
    }, {
      message: googleplusMsg,
      service: "googleplus"
    }, {
      message: pinterestMsg,
      service: "pinterest"
    }, {
      message: twitterMsg,
      service: "twitter"
    }
  ];

  return socialMediaMessages;
}
