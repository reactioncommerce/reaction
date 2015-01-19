#Themes

Reaction uses [Bootstrap 3](http://getbootstrap.com/css/#less) and the [Less](http://lesscss.org) preprocessor to create its theme. 

## Customizing Themes
To extend and create your own themes, you can edit the the example files:

    client/themes/custom.bootstrap.import.less
    client/themes/custom.reaction.import.less

`client/themes/custom.bootstrap.import.less` is the default bootstrap settings. Here you can configure things like background, fonts, etc.

`client/themes/custom.reaction.import.less` contains all the Reaction Commerce styles. 

The `custom.reaction.less` file imports the `custom.bootstrap.less`, which in turn is created automatically from `client/themes/custom.bootstrap.import.less`, so there is an order of precedence, and any change you make in `custom.bootstrap.import.less` will cascade down to `custom.reaction.less`, but changes made in `custom.reaction.import.less` will override changes made in any other file.

You can modify either the `custom.bootstrap.json` or `custom.reaction.json` files to completely exclude (or include) particular Bootstrap or Reaction style elements.

You should not modify `custom.bootstrap.mixins.import.less`, `custom.reaction.mixins.import.less`, `custom.bootstrap.less`, `custom.reaction.less`, as these files are generated whenever you edit one of the user configurable files.

## Importing Themes   
For a quick example, edit `client/themes/customer.reaction.import.less`, and after the first import statement, add:

```less  
//--> Import example Bootstrap 3 theme using generic theme from bootswatch
@import "http://bootswatch.com/slate/bootswatch.less";
@import "http://bootswatch.com/slate/variables.less";
```

This will load a typical Bootstrap theme from Bootswatch.com, but you of course are free to load any theme or build your own. Any prebuilt theme should get you quite far, but there will be customization needed. 

For reference when customizing, review the `import` files in the `client/themes` directory for an idea of mixins and variables that are available.

## Theme Packages
By default, we load the package `reactioncommerce:core-theme`, which contains the default theme. If you are using `reactioncommerce:core` as a stand-alone package, you should run `meteor add reactioncommerce:core-theme` for your Meteor application to install this. We also use the `nemo64:bootstrap` package, which you may need to install to get styles working. Within `reactioncommerce:core` there is a build plugin that takes the files from the `reactioncommerce:core-theme` package and builds the less files in the `client/themes` directory of your application.

You can build your own theme packages, using the https://github.com/reactioncommerce/reaction-core-theme as a template. See the [Meteor documentation](http://docs.meteor.com/#/full/writingpackages) for details on publishing packages. For testing locally, or if you don't want your custom theme package to be public, just copy the package into the `reaction/packages` directory.

## Theme Build Configuration
For Bootstrap see the documentation at https://github.com/Nemo64/meteor-bootstrap

The default configuration file for Reaction build is:

    {"modules": {
      "accounts":        true,
      "cart":            true,
      "dashboard":       true,
      "layout":          true,
      "products":        true
    }}

If you are installing into your own application, you should save this in your project as `custom.reaction.json`. We automatically insert an import to `client/themes/custom.bootstrap.less`, so if you are not using the nemo64:bootstrap package, or choose a different location for your themes, you will need to edit the import statement in `client/themes/custom.reaction.import.less`.

## Alternate HTML/CSS Frameworks
We've developed with Bootstrap, as it's the most common UI framework, however there are other great frameworks such as Zurb's Foundation, and other pre-processors like `Sass` or `Stylus`. It should be possible to abstract out the reaction-core classes, and use these other tools in combination with a custom theme package. Let us know if you want to get your hands dirty on this, and we'll be excited to help.


#Questions

Asked: 
    What's the correlation between reaction-core-theme/theme/accounts/inline/inline.less and reaction-core/client/templates/inline/inline.import.less ?

Where do changes go?

Replied: 
    See https://github.com/reactioncommerce/reaction-core/blob/12c8a495a20b0ebc699bd31d7023500e3fbc85e0/server/buildtools/module-definitions.js for the mapping logic.

You can make an update in reaction-core-theme if you think it’s something worth contributing back, just create a Pull Request to the `development` branch, and we'll review the update and merge. Alternatively, you could clone the repo and use as your own theme.  *Let us know if it's great and we'll add it to the app gallery.* 

Lastly, but most common, to just generally customize your instance, edit the `custom.` files in `client/themes`.

`To extend and create your own themes, you can edit the the example files`:

    client/themes/custom.bootstrap.import.less
    client/themes/custom.reaction.import.less.

