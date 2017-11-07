/* global baseStyles */
import postcss from "postcss";
import postcssJS from "postcss-js";
import autoprefixer from "autoprefixer";
import cssAnnotation from "css-annotation";
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Shops, Themes } from "/lib/collections";
import { Reaction } from "./core";

/**
 * @file UI methods for CSS and Themes - Uses {@link http://postcss.org/|PostCSS},
 * {@link https://github.com/postcss/autoprefixer|Autoprefixer} and
 * {@link https://github.com/morishitter/css-annotation|CSS Annotation}.
 *
 * @namespace Methods/ui
 */

const prefixer = postcssJS.sync([autoprefixer]);

/**
 * @name objectToCSS
 * @private
 * @method
 * @memberof Methods/ui
 * @summary Uses `process` from {@link http://api.postcss.org/Processor.html#process|PostCSS JS}
 * @param  {Object} styles [description]
 * @return {Object}        Promise proxy
 */
function objectToCSS(styles) {
  const prefixedStyles = prefixer(styles);
  return postcss().process(prefixedStyles, { parser: postcssJS });
}

/**
 * @name processAnnotations
 * @method
 * @memberof Methods/ui
 * @summary Uses `parse` method from {@link https://github.com/morishitter/css-annotation|CSS Annotation}
 * @param  {String} stylesheet Stylesheet stringified
 * @return {Array}             Array of parsed CSS
 */
function annotateCSS(stylesheet) {
  check(stylesheet, String);
  return cssAnnotation.parse(stylesheet);
}

/**
 * @name cssToObject
 * @method
 * @memberof Methods/ui
 * @param  {String|null|undefied|void} styles CSS as a string
 * @return {Object}        Object with CSS styles
 */
function cssToObject(styles) {
  check(styles, Match.OneOf(String, null, undefined, void 0));

  const parsedStyle = postcss.parse(styles || baseStyles);
  const styleObject = postcssJS.objectify(parsedStyle);

  return styleObject;
}

/**
 * @name themeToCSS
 * @method
 * @memberof Methods/ui
 * @param  {Object} theme Theme
 * @return {String}       Stringified CSS
 */
function themeToCSS(theme) {
  check(theme, Object);
  let output = "";

  for (const component of theme.components) {
    output += component.styles;
  }

  return output;
}

/**
 * @name updateStyles
 * @method
 * @memberof Methods/ui
 * @param  {Object} data Object with `styles`
 * @return {Boolean}     True on success or error object
 */
function updateStyles(data) {
  check(data, Object);
  this.unblock();

  objectToCSS(data.styles).then((result) => {
    if (result.css) {
      return Themes.update({
        "name": data.theme.name,
        "components.name": data.component.name
      }, {
        $set: {
          ["components.$.styles"]: result.css
        }
      });
    }
  });
}

/**
 * @name publishTheme
 * @method
 * @memberof Methods/ui
 * @example Meteor.call("ui/publishTheme", theme, (error))
 * @param  {Object} theme Theme
 * @return {Boolean}     True on success or error object
 */
function publishTheme(theme) {
  check(theme, Object);
  this.unblock();
  const styles = themeToCSS(theme);

  Shops.update({
    _id: Reaction.getShopId()
  }, {
    $set: {
      theme: {
        themeId: theme._id,
        styles: styles
      }
    }
  });
}

/**
 * @name registerTheme
 * @method
 * @memberof Methods/ui
 * @example Reaction.registerTheme(Assets.getText("themes/button.css"));
 * @param  {String} styles Stringified CSS
 * @return {Boolean}     True on success or error object
 */
export function registerTheme(styles) {
  check(styles, String);

  const annotations = cssAnnotation.parse(styles);
  const {
    name,
    label,
    theme
  } = annotations[0];

  const hasComponent = Themes.find({
    "name": theme,
    "components.name": name
  }).count();

  if (hasComponent) {
    Themes.update({
      "name": theme,
      "components.name": name
    }, {
      $set: {
        "components.$": {
          name,
          label: label || name,
          styles,
          annotations
        }
      }
    });
  } else {
    Themes.upsert({
      name: theme
    }, {
      $set: {
        name: theme
      },
      $push: {
        components: {
          name,
          label: label || name,
          styles,
          annotations
        }
      }
    });
  }
}

/**
 * @name duplicateTheme
 * @method
 * @memberof Methods/ui
 * @example Meteor.call("ui/duplicateTheme", theme)
 * @param  {String} name Name of theme
 * @return {Boolean}     True on success or error object
 */
function duplicateTheme(name) {
  check(name, String);

  const theme = Themes.find({
    theme: name
  });

  delete theme._id;
  theme.name = `${name} copy`;

  return Themes.insert(theme);
}

Meteor.methods({
  "ui/updateStyles": updateStyles,
  "ui/publishTheme": publishTheme,
  "ui/cssToObject": cssToObject,
  "ui/registerTheme": registerTheme,
  "ui/processAnnotations": annotateCSS,
  "ui/duplicateTheme": duplicateTheme,
  "ui/themeToCSS": themeToCSS
});
