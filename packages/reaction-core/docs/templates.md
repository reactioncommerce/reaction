#Templates

To add or change features, or make non CSS layout updates you can create your own templates.  [Iron Router](https://github.com/EventedMind/iron-router) manages paths, layouts, and which templates load where.

Review the Iron Router docs for background information, then reference the file [*packages/reaction-core/client/routing.coffee*](https://github.com/ongoworks/reaction-core/blob/master/client/routing.coffee).  Here you will be able so see how all the default routes, paths, and template layouts are configured.


###routing.coffee

[*client/routing.coffee](https://github.com/ongoworks/reaction/blob/master/client/routing.coffee) can be customized 
to change layouts

If you are adding reaction-core to an existing site, you should *mrt add iron-router* and add to your router file:

```coffeescript
ReactionController = ShopController.extend
  layoutTemplate: "layout"
```
