# Themes
The default Reaction theme (core-theme) uses [Bootstrap 3](https://getbootstrap.com/css/#less) and the [Less](https://lesscss.org) preprocessor to build the theme.

## Customizing Themes
**To add or override custom styles:**

In **client/themes** you can create your own theme directory and `.less` files:

```
mkdir -p client/themes/custom
touch client/themes/custom.less
```

**NOTE**
Meteor's standard load order applies to theme files not loaded from a custom package. Read more on this at the official [meteor documentation](http://docs.meteor.com/#/full/structuringyourapp).

## Creating Reusable Theme Packages (Recommended)

### Step 1
copy `packages/my-custom-theme-template` to `packages/my-custom-theme`, rename the folder to what ever you want

### Step 2
open `packages/my-custom-theme/package.js` and modify package name summary as needed. An example of `package.js` included below.

```
Package.describe({
  name: "my:custom-theme",
  summary: "My Custom Theme",
  version: "0.1.0"
});

Package.onUse(function (api) {
  // Works with meteor 1.2 and above
  api.versionsFrom("METEOR@1.2");

  // Use your favorite preprocessor
  api.use("less");
  // api.use("stylus");

  // Include core theme to get its base styles
  // (Optional, but recommended for a starting point)
  api.use("reactioncommerce:core-theme@2.0.0");

  // Add files what will be imported into your theme.less file
  api.addFiles([
    "/path/to/file.less"
  ], "client", {isImport: true});

  // Add top level .less files
  // These will be processed by your included preprocessors (less, styles, or sass)
  api.addFiles([
    "theme.less"
  ], "client");
});
```

### Step 3

open `.meteor/packages` and modify the following line at the bottom of the file.

```
# Themes
reactioncommerce:default-theme
#my:custom-theme
```

Comment the line with `reactioncommerce:default-theme` (add # at the beginning) and uncomment (remove the #) on the line with `my:custom-theme` to enable the theme. The name `my:custom-theme` represents the name of your theme package in the `package.js` file in `packages/my-custom-theme/package.js`. If you modified the name, be sure to change it here to match as well.

If your custom theme is complete enough to replace the standard core-theme altogether, feel free to remove the lines with `@import "{reactioncommerce:core-theme}...` from main.less.

### Step 4
open `main.less` add css and/or imports here.

```
/*
  Write and/or import all other styles into this file
  Be sure to also include them in package.js under


  api.addFiles([
    "/styles/base.less" // An example of a less files that will be imported into main.less
  ], "client", {isImport: true});

  - or -

  api.addFiles("/path/to/file.less", "client", {isImport: true})

*/

// Get bootstrap variables
@import "{reactioncommerce:core-theme}/lib/bootstrap/less/variables.less";

// Import our styles
@import "/styles/base.less";

```

In `styles`, you can add all your less files and then include them in your `main.less`.


**NOTE**
There are many ways to go about building a theme, this is a representation of one of those methods. If you've got a good handle on how meteor and its packages work, feel free to use the method you're most comfortable.


## Core Theme Bootstrap RTL (Right to Left)
Support for Right to Left languages

The `rtl` class is added when the shops.languages language direction is 'rtl'. See [packages/core-theme/default/bootstrap.rtl.less](https://github.com/reactioncommerce/reaction/blob/development/packages/reaction-core-theme/default/bootstrap.rtl.less) file for RTL mixins that you should use instead of standard css properties when editing LESS themes.

For example, instead of

```
  .mystyle {
    padding-right: 50px;
  }
```

You should use the RTL mixin:

```
  .mystyle {
    .padding-right(50px);
  }
```

The following RTL mixins are available:
- .rtl
- .ltr
- .left
- .right
- .margin-left
- .margin-right
- .padding-left
- .padding-right
- .float
- .clear
- .text-align

## Alternate HTML/CSS Frameworks
We've developed with Bootstrap, as it's the most common UI framework, however there are other great frameworks such as Zurb's Foundation, and other pre-processors like `Sass` or `Stylus`. By using the **Creating Reusable Theme Packages** method above, you can implement any of the different css frameworks and preprocessors for your own custom theme.

Let us know if you want to get your hands dirty on this, and we'll be excited to help.
