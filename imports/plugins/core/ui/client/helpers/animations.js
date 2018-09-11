import { Meteor } from "meteor/meteor";

/**
 * @name highlightInput
 * @summary Uses a CSS animation to briefly highlight an input
 * @param {HTMLInputElement} inputRef - Input to animate
 * @param {String} className - The class name to toggle that contains animation
 * @returns {undefined}
 */
export function highlightInput(inputRef, className = "highlight") {
  let input = inputRef;
  if (input._rootDOMNode) {
    input = input._rootDOMNode;
  }

  input.classList.add(className);
  Meteor.setTimeout(() => {
    input.classList.remove(className);
  }, 500);
}

/**
 * @name highlightVariantInput
 * @summary Does the same as highlightInput, but with a lighter green color
 * @param {HTMLInputElement} inputRef - Input to animate
 * @returns {undefined}
 */
export function highlightVariantInput(inputRef) {
  highlightInput(inputRef, "highlight-variant");
}
