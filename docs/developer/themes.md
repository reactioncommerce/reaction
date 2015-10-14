# Themes
The default Reaction theme (reaction-bootstrap-theme / core-theme) uses [Bootstrap 3](https://getbootstrap.com/css/#less) and the [Less](https://lesscss.org) preprocessor to build the theme.

## Customizing Themes
**To add or override custom styles:**

In **client/themes/bootstrap** you can create custom styles in `custom.reaction.import.less`.

However, another approach is to create your own theme directory and import.less file:

```
mkdir -p client/themes/custom
touch client/themes/custom.import.less
```

In  **/client/themes/bootstrap/custom.reaction.overrides.import.less**,  import `custom.import.less`:

```
@import "../custom/custom.import.less";
```

This will allow you to reset the theme using `rm client/themes/bootstrap/*.less` without risking your own updates.

Files are loaded in this order, top to bottom.
- custom.reaction.less
- custom.reaction.import.less **(imported first, user modifiable)**
  - custom.bootstrap.less
    - custom.bootstrap.import.less
      - custom.bootstrap.mixins.import.less
      - custom.reaction.mixins.import.less

  - custom.reaction.variables.import.less

- custom.reaction.overrides.import.less **(imported last in custom.reaction.less)**

_Note: Comments at the top of the file will let you know if the file is safe to be edited._

The **custom.reaction.less** file imports the **custom.bootstrap.less**, which in turn is created automatically from **client/themes/custom.bootstrap.import.less**, so there is an order of precedence, and any change you make in **custom.bootstrap.import.less** will cascade down to **custom.reaction.less**, but changes made in **custom.reaction.overrides.import.less** will override changes made in any other file.

You can modify either the **custom.bootstrap.json** or **custom.reaction.json** files to completely exclude (or include) particular Bootstrap or Reaction style elements.

## Importing Themes
For a quick example, edit `client/themes/custom.reaction.import.less`, and add:

```less
//--> Import example Bootstrap 3 theme using generic theme from bootswatch

@import "http://bootswatch.com/cyborg/bootswatch.less";
@import "http://bootswatch.com/cyborg/variables.less";
```

This will load a typical Bootstrap theme from Bootswatch.com, but you of course are free to load any theme or build your own. Any prebuilt theme should get you quite far, but there will be customization needed.

For reference when customizing, review the `import` files in the `client/themes` directory for an idea of mixins and variables that are available.

## Theme Packages
By default,  Reaction loads `reactioncommerce:bootstrap-theme`, which include a dependency `reactioncommerce:core-theme` package, which contains the LESS theme.

 If you are using `reactioncommerce:core` as a stand-alone package, you should the add reaction themes, plus any dependency requirements. The default  **reactioncommerce:bootstrap-theme**  also requires **nemo64:bootstrap**.

```
meteor add reactioncommerce:bootstrap-theme nemo64:bootstrap
```

Within **reactioncommerce:core** there is a build plugin (reactioncommerce:bootstrap-theme) that takes the files from the **reactioncommerce:core-theme** package and builds the less files in the `client/themes` directory of your application.

You can create your own theme packages, using the [reactioncommerce:core-theme](https://github.com/reactioncommerce/reaction-core-theme) and [reactioncommerce:bootstrap-theme]((https://github.com/reactioncommerce/reaction-bootstrap-theme) as a template.

See the [Meteor documentation](https://docs.meteor.com/#/full/writingpackages) for details on publishing packages. For testing locally, or if you don't want your custom theme package to be public, just copy the package into the `reaction/packages` directory, or add to the `PACKAGE_DIRS` environment variable.

## Building Themes
`reactioncommerce:bootstrap-theme` is the theme build package. This compiles the `reactioncommerce:core-theme` theme (less files) into the app `client/themes/` directory.

For the Bootstrap build package see the documentation at [https://github.com/Nemo64/meteor-bootstrap](https://github.com/Nemo64/meteor-bootstrap)

The default configuration file for Reaction build is:

```
{"modules": {
  "accounts":        true,
  "cart":            true,
  "dashboard":       true,
  "layout":          true,
  "products":        true,
  "core": true
}}
```

If you are installing into your own application, you should save this in your project as `custom.reaction.json`. We automatically insert an import to `client/themes/custom.bootstrap.less`, so if you are not using the nemo64:bootstrap package, or choose a different location for your themes, you will need to edit the import statement in `client/themes/custom.reaction.import.less`.

## RTL - Right to Left
Support for Right to Left languages

The `rtl` class is added when the shops.languages language direction is 'rtl'. See [core-theme/default/mixins.less](https://github.com/danielgindi/reaction-core-theme/blob/development/default/mixins.less#L200) file for RTL mixins that you should use instead of standard css properties when editing LESS themes.

For example, instead of

```
    .mystyle {
      padding-right: 50px;
    }
```

You should use the RTL mixin:

```
    .mystyle {
      .padding-right: 50px;
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
We've developed with Bootstrap, as it's the most common UI framework, however there are other great frameworks such as Zurb's Foundation, and other pre-processors like `Sass` or `Stylus`. It should be possible to abstract out the reaction-core classes, and use these other tools in combination with a custom theme package. Let us know if you want to get your hands dirty on this, and we'll be excited to help.
