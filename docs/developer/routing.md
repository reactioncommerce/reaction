# Routing

[*common/routing.js](https://github.com/reactioncommerce/reaction/blob/master/common/routing.js) can be customized to change layouts.

If you are adding reaction-core to your own meteor application, `iron:router` is installed as a dependency of `reactioncommerce:core`.

You can defines routes at the app level. You can also extend the core routing, at the app level.

```javascript
var ReactionController;

ReactionController = ShopController.extend({
  layoutTemplate: "layout"
});
```

## Iron Router > Configuration

```
Router.configure({
  layoutTemplate: 'Main',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound',
  load: function() {
    return $('html, body').animate({
      scrollTop: 0
    }, 400)($('.content').hide().fadeIn(1000));
  },
  waitOn: function() {
    return Meteor.subscribe('recordSetThatYouNeedNoMatterWhat');
  }
});
```

## Iron Router > Mapping

```
Router.map ->
```

If you don't provide a template, the route will assume the template name is the same as the route name.

```
this.route 'Homepage',     path: '/'
```

Where it makes sense, options can be set globally via Router.configure()

```
this.route 'Contact',     layoutTemplate: 'Layout'
```

The layout template to render.     

```
loadingTemplate: 'Loading'
```

The template used by the loading hook.     

```
notFoundTemplate: 'NotFound'
```

 The template used by the dataNotFound hook -- renders if the data() function returns something falsey.    

```
template: 'Contact'
```

The template to render. We've seen that by default this is just the name of the route.     

```
path: '/contact'
```

the route will map to the path /contact     

```
where: 'client'
```

whether this route runs on the client or the server (client by default)

```
    yieldTemplates: 'MyAsideTemplate': {to: 'aside'} 'MyFooter': {to: 'footer'}
```

One Required Parameter

```
  this.route 'PostShow',
```

Using a Custom Action Function

```
action: ->
  # this: instance of RouteController
  # access to: this.params, this.wait, this.render, this.redirect
  @render()
  @render('templateName')
  @render('templateName', {to: 'region'})
```

When we do not specify a controller, run the route will look for a global object

```
named "PostShowController", after the name of the route
```

We can change this behavior by providing a controller option to the route like so:

```
controller: 'CustomController'
data: ->
  // The data value can either be an object or a function that gets evaluated later // (when your route is run).
  // `this` is an instance of a RouteController in the data function above.
  return Posts.findOne(@params._id)

load: ->
  // this doesn't run again if your page reloads via hot-code-reload,
  // so make sure any variables you set will persist over HCR (for example Session variables).
  console.log 'runs just once when the route is first loaded.'

onBeforeAction: ->
  // The value can be a function or an array of functions which will be executed in the order they are defined.
  // You can access the current data context using the getData function inside of any of your route functions.
  post = @getData()
  console.log 'runs before the action function (possibly many times if reactivity is involved).'

onAfterAction: ->
  // The value can be a function or an array of functions which will be executed in the order they are defined.
  console.log 'runs after the action function (also reactively).'

  // matches: '/posts/{x}'
  //to set an optional paramater, :optionalParam?

  path: '/posts/:_id'

unload: ->
  // This is called when you navigate to a new route
  console.log 'runs just once when you leave the route for a new route.'

waitOn: ->
  // The waitOn function can return any object that has a ready method.
  // It can also return an array of these objects if you'd like to wait on multiple subscriptions.
  // If you've provided a loadingTemplate, the default action will be to render that template.
  return Meteor.subscribe('post', @params._id)
```

Multiple Parameters

```
  this.route 'TwoSegments',
  // matches: '/posts/1/2'
  // matches: '/posts/3/4'
  path: '/posts/:paramOne/:paramTwo'
```

Anonymous Parameter Globbing

```
  this.route 'Globbing',
  // matches: '/posts/some/arbitrary/path'
  // matches: '/posts/5'
  //route globs are available
  path: '/posts/*'
```

Named Parameter Globbing

```
  this.route 'NamedGlobbing',
  // matches: '/posts/some/arbitrary/path'
  // matches: '/posts/5'
  // stores result in this.params.file
  path: '/posts/:file(*)'
```

Regular Expressions

```
  this.route 'RegularExpressions',
  // matches: '/commits/123..456'
  // matches: '/commits/789..101112'
  path: /^\/commits\/(\d+)\.\.(\d+)/
```

When you define a server route (via where: 'server'), you need to define the action function, and use in a fairly simplistic way, much like express.

The render method is not available. Also, you cannot waitOn subscriptions or call the wait method on the server.

Server routes get the bare request, response, and next properties of the Connect request, as well as the params object just like in the client.

```
  this.route 'ServerRoute',     action: ->       filename = @params.filename;
  this.response.writeHead(200, {'Content-Type': 'text/html'});
  this.response.end('hello from server');

  where: 'server'
```

## Iron Router > Hooks
For all the hooks below, the second argument can be except -- a list of routes to not apply to, or only -- a limited set of routes to match.

```
Router.onRun ->
  //if the page hot code reloads, the onRun hook will not re-run.
  console.log 'this happens once only when the route is loaded.'

Router.onData ->   console.log 'runs reactively whenever the data changes.'

Router.onBeforeAction ->   console.log 'runs reactively before the action.'

Router.onAfterAction ->   console.log 'runs reactively before the action.'

Router.onStop ->   console.log 'runs once when the controller is stopped, like just before a user routes away.'
```

## Iron Router > Route Controllers
AdminController = RouteController.extend

We can define almost all of the same options on our RouteController as we have for our routes.

Note that `where` is not available on controllers, only in Router.map.

```
  onBeforeAction: function() {
    //a user filter to control access?
  }

  var PostsEditController;

  PostsEditController = AdminController.extend({
    waitOn: function() {
      return Meteor.subscribe('adminPost');
    }
  });

  Router.map(function() {
    return this.route(postsEdit, {
      path: '/posts/:_id/edit'
    });
  });
```

## Iron Router > Helpers

```
Router.routes['Homepage']                   // get the route by name Router.routes['PostShow'].path({_id: 1})    // return '/posts/1'
Router.go('Homepage')            // redirect to the defined route (here: '/') Router.go('PostShow', {_id: 7})  //redirect to '/posts/7'

Router.path('Homepage')          // return the path of the defined route as a string. (here: '/')
Router.current().path            // return the current path
```

## Iron Router > Extending Existing Routes

At the app level you can define the following:

```
// This can be placed in "reaction/common/routing.js".
Router.map(function route() {
  _.extend(Router.routes.nameOfRoute.options, {
    // Just an example. You can put any Iron Router options here.
    yieldTemplates: {
      checkoutHeader: {
        to: "layoutHeader"
      }
    }
  });
});
```
