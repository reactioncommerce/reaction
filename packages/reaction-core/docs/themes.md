#Themes

Reaction uses [Bootstrap 3](http://getbootstrap.com/css/#less) and the [Less](http://lesscss.org) preprocessor to create its theme. 

To extend and create your own themes, you can edit the the example file:

    client/themes/default.less
    
  
For a quick example, edit and uncomment *default.less*

```less  
// Import Bootstrap 3 + Reaction mixins/variables
@import "packages/reaction-core/client/themes/imports.less";

// Import example Boostrap 3 theme using generic theme from bootswatch
@import "http://bootswatch.com/amelia/bootswatch.less";
@import "http://bootswatch.com/amelia/variables.less";

```
This will load a typical bootstrap theme from Bootswatch.com, but you of course are free to load any theme or build your own.  Any prebuilt theme should get you quite far, but there will be customization needed. 

For reference when customizing,  review the files in the directory *packages/reaction-core/client/themes/* for an idea of mixins and variables that are available.
