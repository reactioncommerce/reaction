let postcss = Npm.require("postcss");
let postcssJS = Npm.require("postcss-js");
let autoprefixer = Npm.require("autoprefixer");
const util = Npm.require("util");
let prefixer = postcssJS.sync([autoprefixer]);

// Test Styles
const baseStyles = `
  body {
    background-color: black;
  }

  .rui.tagnav {
    background-color: white;
  }
  `;

/*

    @media screen and (max-width: 32em) {
      background-color: #ff00ff;
    }
 */

function getStyleObject() {
  this.unblock();
  const parsedStyle = postcss.parse(baseStyles);
  const styleObject = postcssJS.objectify(parsedStyle);

  return styleObject;
}

function cssToObject(styles) {
  check(styles, Match.OneOf(String, null, void 0));
console.log("styles");
  const parsedStyle = postcss.parse(styles || baseStyles);
  const styleObject = postcssJS.objectify(parsedStyle);

  return styleObject;
}

function processStyles(styles) {
  check(styles, Object);
  this.unblock();

  const prefixedStyles = prefixer(styles);
  postcss()
    .process(prefixedStyles, {parser: postcssJS})
    .then((result) => {
      console.log(result.css);
      ReactionCore.Collections.Themes.upsert({
        name: "base"
      }, {
        $set: {
          styles: result.css
        }
      });
    });

  // console.log("style object", processedStyles);

  // return processedStyles;
}


Meteor.methods({
  "layout/getStyleObject": getStyleObject,
  "layout/processStyles": processStyles,
  "layout/cssToObject": cssToObject
});
