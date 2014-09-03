#Templates

To add or change features, or make non CSS layout updates you can create your own templates.  [Iron Router](https://github.com/EventedMind/iron-router) manages paths, layouts, and which templates load where.

Review the Iron Router docs for background information, then reference the file [*packages/reaction-core/client/routing.coffee*](https://github.com/ongoworks/reaction-core/blob/master/client/routing.coffee).  Here you will be able so see how all the default routes, paths, and template layouts are configured.

# Extending and customizing templates

To extend and customize the html for any reaction/meteor template, add a template extension map to `client/templates.coffee` 

```
# extending core with template extensions
Template.my_custom_template.replaces("core_template_name")

```

then create a template (probably a copy of the one you are extending)

```
<template name="my_custom_template">
    <h1>This will be used instead of the core template!</
</template>
```

*The template helpers,events, etc from the original are still accessible and used in the new extended template.*

### Routing

[*client/routing.coffee](https://github.com/ongoworks/reaction/blob/master/client/routing.coffee) can be customized 
to change layouts

If you are adding reaction-core to an existing site, you should *mrt add iron-router* and add to your router file:

```coffeescript
ReactionController = ShopController.extend
  layoutTemplate: "layout"
```
