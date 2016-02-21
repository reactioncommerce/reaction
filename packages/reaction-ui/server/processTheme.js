const postcss = Npm.require("postcss");
const postcssJS = Npm.require("postcss-js");
const autoprefixer = Npm.require("autoprefixer");
const cssAnnotation = Npm.require("css-annotation");
const prefixer = postcssJS.sync([autoprefixer]);

function annotateCSS(stylesheet) {
  check(stylesheet, String);
  return cssAnnotation.parse(stylesheet);
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

function themeToCSS(theme) {
  check(theme, Object);
  let output = "";

  for (let component of theme.components) {
    output += component.styles;
  }

  return output;
}

function updateStyles(data) {
  check(data, Object);
  this.unblock();

  objectToCSS(data.styles).then((result) => {
    if (result.css) {
      return ReactionCore.Collections.Themes.update({
        "theme": data.theme.theme,
        "components.name": data.component.name
      }, {
        $set: {
          [`components.$.styles`]: result.css
        }
      });
    }
  });
}

function publishTheme(theme) {
  check(theme, Object);
  this.unblock();
  const styles = themeToCSS(theme);

  ReactionCore.Collections.Shops.update({
    _id: ReactionCore.getShopId()
  }, {
    $set: {
      theme: {
        themeId: theme._id,
        styles: styles
      }
    }
  });
}

function registerTheme(styles) {
  check(styles, String);

  const annotations = cssAnnotation.parse(styles);
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
          styles,
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
  "ui/updateStyles": updateStyles,
  "ui/publishTheme": publishTheme,
  "ui/cssToObject": cssToObject,
  "ui/registerTheme": registerTheme,
  "ui/processAnnotations": annotateCSS,
  "ui/duplicateTheme": duplicateTheme,
  "ui/themeToCSS": themeToCSS
});

ReactionUI.registerTheme = registerTheme;
