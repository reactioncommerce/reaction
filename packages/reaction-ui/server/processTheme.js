const postcss = Npm.require("postcss");
const postcssJS = Npm.require("postcss-js");
const autoprefixer = Npm.require("autoprefixer");
const util = Npm.require("util");
const annotation = Npm.require("css-annotation");
const prefixer = postcssJS.sync([autoprefixer]);
const Future = Npm.require("fibers/future");

// TODO: Move this into a testing
const test = `
/**
 * @theme base
 * @label Navbar
 * @name navbar
 * @author Reaction Commerce
 * @url https://reactioncommerce.com
 */
@import "variables.css";
@import "variables2.css" @media screen and (max-width: 10em);

body {
  /**
   * @label Page Background
   * @example <body>
   * </body>
   */
  background-color: white;

  @media screen and (max-width: 32em) {
    /**
     * @label Mobile
     */
    background-color: #ff00ff;
  }

  @media screen and (max-width: 48em) {
    /**
     * @label Tablet
     */
    background-color: #FBFBFB;
  }
}

.navbar {
  @media screen and (max-width: 32em) {
    /**
     * @label Mobile
     */
    background-color: green;
  }
}
`

function everything(style) {
  // -- Begin very verbose comments
  // Process and obtain an array of annotations from the comments of the supplied style string
  const annotations = annotateCSS(style);
  // Process a style string and receive an object
  const cssObject = cssToObject(style);

  // All Processed selectors, to be returned at the end
  let selectors = [];

  // Store the annotations as an object, where the key is the selector / rule
  // Making it a little easier to retrieve the desired annotation
  let annotationsBySelector = {};

  if (annotations) {
    for (let annotation of annotations) {
      const {rule} = annotation;

      if (rule) {
        annotationsBySelector[rule] = annotation;
      }
    }
  }

  // Loop through all selectors in the cssObject
  _.each(cssObject, (properties, selector) => {
    // Create a blank item to start storing our selectors, decelarations, etc.
    let item = {}

    // If the properties of this particulary declaration block are an object
    //
    // The below example is a selector with ab object of containing
    // property declarations:
    //
    // ".selector": {
    //   "backgroundColor": "#ff00ff"
    // }
    //
    if (_.isObject(properties)) {
      // Save the selctor
      item.selector = selector;

      // Find the matching annotation if any
      item.annotation = annotationsBySelector[selector];

      // Create a blank array so we can start processing the properties
      item.declarations = [];

      // Loop through all the properties for this given style declaration block
      _.each(properties, (value, property) => {

        // If the name of the property starts with an @ [at sign], then its an atrule
        // For example: @media is an atrule;
        // @media screen and (max-width: 32em) {}
        //
        if (property.indexOf("@") === 0) {

          // If the vale of the atrule is an object containing properties
          if (_.isObject(value)) {
            // A place to store any at rule property declarations
            let atRuleDeclarations = []

            // We loop through those properties and save them to subProps
            _.each(value, (atRuleValue, atRuleProperty) => {
              atRuleDeclarations.push({
                property: atRuleProperty,
                value: atRuleValue,
                type: "atrule",
              });
            });

            // Add this at rule decloration to our item object's declarations
            item.declarations.push({
              property,
              declarations: atRuleDeclarations,
              annotation: _.find(annotations, (annotation) => {
                return `@${annotation.atrule} ${annotation.params}` === property
              })
            });

          } else {

            // Other wise the at rule's value is added to our item object's declarations
            // For example: @import "style.css"
            // the value is literal true, because theres no block like a @media {} query
            item.declarations.push({
              property,
              value
            });
          }
        } else {

          // If the propetry name is not some special declaration, then handle it normally
          // For example:
          // "backgroundColor": "#ff00ff"
          // where "backgroundColor" is the property
          // and "#ff00ff" is the value
          item.declarations.push({
            property,
            value
          });
        }
      });
    } else {
      // And finally, if this style declaration does not have a body, then just add its properties
      // For example: @import "style.css"
      // where @import "style.css" is the selector
      // and true (Boolean) is the value
      item = {
        selector,
        value: properties
      }
    }

    // Add to our ongoing selectors array;
    selectors.push(item);
  })

  // And at last, return the result
  // Suitable for inserting into a collection or using with template {{#each}} statements
  return selectors;
}

function getStyleObject() {
  this.unblock();
  const parsedStyle = postcss.parse(baseStyles);
  const styleObject = postcssJS.objectify(parsedStyle);

  return styleObject;
}

function annotateCSS(stylesheet) {
  check(stylesheet, String);
  return annotation.parse(stylesheet);
}

function cssToObject(styles) {
  check(styles, Match.OneOf(String, null, undefined, void 0));

  const parsedStyle = postcss.parse(styles || baseStyles);
  const styleObject = postcssJS.objectify(parsedStyle);

  return styleObject;
}

function objectToCSS(styles) {
  const prefixedStyles = prefixer(styles);
  return postcss().process(prefixedStyles, {parser: postcssJS});
}

function processAllStyles(styles) {
  let output = "";

  for (let style of styles) {
    const prefixedStyles = prefixer(styles);
    output += postcss().process(prefixedStyles, {parser: postcssJS});
  }
}

function processStyles(data) {
  check(data, Object);
  this.unblock();

  objectToCSS(data.styles)
    .then((result) => {
      ReactionCore.Collections.Themes.update({
        "theme": data.theme.theme,
        "stylesheets.name": data.stylesheet.name
      }, {
        $set: {
          "stylesheets.$.styles": result.css
        }
      });
    });
}

function registerTheme(styles) {
  check(styles, String);

  const annotations = annotation.parse(styles);
  const {
    name,
    label,
    theme
  } = annotations[0];

  const hasComponent = ReactionCore.Collections.Themes.find({
    "theme": theme,
    "components.name": name
  }).count();

  if (hasComponent) {
    ReactionCore.Collections.Themes.update({
      theme,
      "components.name": name
    }, {
      $set: {
        "components.$": {
          name,
          label: label || name,
          styles: everything(styles)
        }
      }
    });

  } else {
    ReactionCore.Collections.Themes.upsert({
      theme
    }, {
      $set: {
        theme
      },
      $push: {
        components: {
          name,
          label: label || name,
          styles: everything(styles)
        }
      }
    });
  }
}

function duplicateTheme(name) {
  check(name, String);

  const theme = ReactionCore.Collections.Themes.find({
    theme: name
  });

  delete theme._id;
  theme.theme = `${name} copy`;

  return ReactionCore.Collections.Themes.insert(theme);
}


Meteor.methods({
  "layout/getStyleObject": getStyleObject,
  "layout/processStyles": processStyles,
  "layout/cssToObject": cssToObject,
  "layout/registerTheme": registerTheme,
  "layout/processAnnotations": annotateCSS,
  "ui/duplicateTheme": duplicateTheme
});

ReactionUI.registerTheme = registerTheme;
