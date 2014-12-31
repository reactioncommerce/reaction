#Templates

To add or change features, or make non CSS layout updates you can create your own templates. [Iron Router](https://github.com/EventedMind/iron-router) manages paths, layouts, and which templates load where.

Review the [Iron Router docs](https://github.com/EventedMind/iron-router/blob/devel/DOCS.md) for background information, then reference the file [*packages/reaction-core/common/routing.coffee*](https://github.com/reactioncommerce/reaction-core/blob/master/common/routing.coffee). Here you will be able to see how all the default routes, paths, and template layouts are configured.

# Extending and customizing templates

To extend and customize the html for any reaction/meteor template, add a template extension map to `client/templates.coffee` 

```
# extending core with template extensions
Template.my_custom_template.replaces("core_template_name")

```

then create a template (probably a copy of the one you are extending).

```
<template name="my_custom_template">
    <h1>This will be used instead of the core template!</h1>
</template>
```

While you can always organize your templates however you wish, [we suggest](https://github.com/reactioncommerce/reaction-core/blob/master/docs/conventions.md) you mirror the existing structure. For example, if you are extending the template located in `packages/reaction-core/client/templates/products/products.html` then you would mirror that by creating your new template at `reaction/client/templates/products/myTemplate.html`

*The template helpers, events, etc. from the original are still accessible and used in the new extended template.*

### Routing

[*common/routing.coffee](https://github.com/reactioncommerce/reaction/blob/master/common/routing.coffee) can be customized to change layouts.

If you are adding reaction-core to your own meteor application, `iron:router` is installed as a dependency, but you would add to your router file:

```coffeescript
ReactionController = ShopController.extend
  layoutTemplate: "layout"
```
