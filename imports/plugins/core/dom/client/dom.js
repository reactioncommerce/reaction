/**
 * @file Exposes the DOM object used to manipulate the document.
 * The functions are only meant to be used on the client.
 * @namespace DOM
 */

const DOM = {};

/**
 * @method setMetaTag
 * @memberof DOM
 * @summary Sets/adds a meta tag to the document head
 * @param {Object} attributes - key/value pairs for tag attributes
 * @returns {undefined} no return value
 */
DOM.setMetaTag = (attributes) => {
  const currentMetaTag = document.querySelector(`meta[name="${attributes.name}"]`);

  // If tag exists, just update its content attribute
  if (currentMetaTag) {
    currentMetaTag.setAttribute("content", attributes.content);
    currentMetaTag.setAttribute("data-metatag", "1");
    return;
  }

  // Otherwise, create a new meta tag element
  const newMetaTag = document.createElement("meta");

  newMetaTag.setAttribute("name", attributes.name);
  newMetaTag.setAttribute("content", attributes.content);
  // This attribute will be used to remove meta tags on route changes.
  newMetaTag.setAttribute("data-metatag", "1");

  // Append to document head
  document.head.appendChild(newMetaTag);
};

/**
 * @method addLinkTag
 * @memberof DOM
 * @summary Adds a link tags to the document head
 * @param {Object} attributes - key/value pairs for tag attributes
 * @returns {undefined} no return value
 */
DOM.addLinkTag = (attributes) => {
  const newLinkTag = document.createElement("link");

  for (const key in attributes) {
    if ({}.hasOwnProperty.call(attributes, key)) {
      newLinkTag.setAttribute(key, attributes[key]);
    }
  }

  document.head.appendChild(newLinkTag);
};

/**
 * @method removeDocHeadAddedTags
 * @memberof DOM
 * @summary Removes document head tags
 * @returns {undefined} no return value
 */
DOM.removeDocHeadAddedTags = () => {
  const elements = document.querySelectorAll("[data-metatag='1']");
  for (const element of elements) {
    element.parentNode.removeChild(element);
  }
};

export default DOM;
