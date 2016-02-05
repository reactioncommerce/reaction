const postcss = Npm.require("postcss");
const postcssJS = Npm.require("postcss-js");
const autoprefixer = Npm.require("autoprefixer");
const util = Npm.require("util");
const annotation = Npm.require("css-annotation");
const prefixer = postcssJS.sync([autoprefixer]);
const Future = Npm.require("fibers/future");

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
  return postcss().process(prefixedStyles, {parser: postcssJS})
}

function processStyles(styles) {
  check(styles, Object);
  this.unblock();

  objectToCSS(styles)
    .then((result) => {
      ReactionCore.Collections.Themes.upsert({
        name: "base"
      }, {
        $set: {
          styles: result.css
        }
      });
    });
}

function registerTheme(stylesheet) {
  check(stylesheet, String);

  const annotations = annotation.parse(stylesheet);
  const {
    name,
    theme
  } = annotations[0];

  const hasStylesheet = ReactionCore.Collections.Themes.find({
    "theme": theme,
    "stylesheets.name": name
  }).count();

  if (hasStylesheet) {
    ReactionCore.Collections.Themes.update({
      theme,
      "stylesheets.name": name
    }, {
      $set: {
        "stylesheets.$": {
          name,
          stylesheet,
          annotations
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
        stylesheets: {
          name,
          stylesheet,
          annotations
        }
      }
    });
  }
}


Meteor.methods({
  "layout/getStyleObject": getStyleObject,
  "layout/processStyles": processStyles,
  "layout/cssToObject": cssToObject,
  "layout/registerTheme": registerTheme,
  "layout/processAnnotations": annotateCSS
});

ReactionCore.Themes.registerTheme = registerTheme
