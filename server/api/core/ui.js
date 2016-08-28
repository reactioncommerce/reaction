import postcss from "postcss";
import postcssJS from "postcss-js";
import autoprefixer from "autoprefixer";
import cssAnnotation from "css-annotation";
import { Shops, Themes } from "/lib/collections";
import { Reaction } from "./core";

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

  for (const component of theme.components) {
    output += component.styles;
  }

  return output;
}

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
