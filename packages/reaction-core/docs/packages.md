# Packages

###### Private packages
Packages within Reaction are Meteor packages. There are private packages, that a developer can create to customize any of Reaction's functionality. Private packages can be deployed by including them in the `packages` folder.

###### Public packages
If you create a private package and would like to share it with the Meteor community you can make it publish the package to the Meteor package registry with `meteor publish`.

*Publishing packages is not a requirement to share or deploy packages.*

If you would like to share a package in the registry, but don't want to be responsible for long term ownership of the package, create an issue and let us know. We'll consider forking and maintaining a (reactioncommerce org published version of your package)[https://atmospherejs.com/reactioncommerce].


## Package development

For local package development you must *git clone* packages locally, either into `reaction/packages`, or by creating a symbolic link to the package checkout.

For example:

```bash
  mkdir ~/reactioncommerce
  cd ~/reactioncommerce
  git clone https://github.com/reactioncommerce/reaction.git

  cd reaction/packages
  git clone https://github.com/reactioncommerce/reaction-core.git
  git clone https://github.com/reactioncommerce/reaction-core-theme.git
```

or

```bash
    cd reaction
    ln -s <full path to package>  packages/
```

It's a little more work, but it's a good idea to make sure you are in the `development` branches, and clone all used Reaction packages to ensure you're working with a complete development enviroment.

*Note: Pull requests are happily accepted, please make your GitHub pull request a merge to the `development` branch, and not master.*

*Tip: Copy the settings/dev.sample.json to settings/settings.json and edit the file to retain authentication and meteor settings between `meteor reset`. Start with `meteor --settings settings/settings.json --raw-logs`*

**Create packages**

    meteor create --package

See [Meteor docs](http://docs.meteor.com/#/full/writingpackages) for additional help creating packages.

**Update package.js**

Once you have created your added, cloned, or symlinked your package development folder to the `reaction/packages` directory, you'll continue creating a standard Meteor package by defining `package.js`, starting with a describe block:

```javascript

Package.describe({
  summary: "Reaction Hello World - example package for Reaction",
  name: "reactioncommerce:reaction-helloworld",
  version: "0.1.0",
  git: "https://github.com/reactioncommerce/reaction-helloworld.git"
});

Package.onUse(function (api, where) {
  api.use("reactioncommerce:core@x.x.x"); //current release
  api.addFiles("server/register.coffee",'server');
});
```

Where name is the `org-user:packagename` that you will use to publish this package to the Meteor registry. See: [Meteor package.js docs](http://docs.meteor.com/#/full/packagejs).

Any files you create in your package you will need to add in your [package.js](http://docs.meteor.com/#/full/packagejs) file.

```javascript
api.addFiles('myfile');
```


To test your package, add it to your application :

    meteor add your-new-package

*Tip: You can also add and remove packages by editing `.meteor/packages`*

### ReactionCore.registerPackage
To integrate a package into the rest of Reaction Commerce use
`ReactionCore.registerPackage` to describe package details
and provide some common integration hooks.

Integrate packages with reaction-core by adding **server/register.coffee**

```coffeescript
ReactionCore.registerPackage
  name: 'reaction-paypal' # usually same as meteor package
  autoEnable: false # auto-enable in dashboard,transforms to enabled
  settings:
    # private package settings config (blackbox)
    mode: false
    client_id: ''
    client_secret: ''
    # public package settings
    public:
      notSoSecret: true
  registry: [
    # all options except route and template
    # are used to describe the
    # dashboard 'app card'.
    {
      provides: 'dashboard'
      label: 'PayPal'
      description: 'Accept PayPal payments'
      icon: 'fa fa-paypal'
      cycle: 3
      container: 'paypal'
      permissions: [
        {
          label: "Dashboard"
          permission: "dashboard"
        }
      ]
    }
    # configures settings link for app card
    # use 'group' to link to dashboard card
    {
      route: 'paypal'
      provides: 'settings'
      container: 'paypal'
    }
    # configures template for checkout
    # paymentMethod dynamic template
    {
      template: 'paypalPaymentForm'
      provides: 'paymentMethod'
    }
  ]
```


#### Settings
 ```
 name: '<typically same as package name>'
 autoEnable: '<true/false automatically enable in dashboard>'
 settings:
      <Object:blackbox default properties for service configuration.>
 ```

`settings` is a blackbox object for package settings.

`settings.public` is available to the client.

`autoEnable` transforms into the `enabled` key to a boolean value on insert.

See [settings and fixture data documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/deploying.md)

#### Registry
The registry is used to define routes, dynamic templates, and some package UI handling.

A `registry` object can be any combination of properties, with `provides` being the only required element.

*Note: The registry is currently refreshed only on update/deleting the package record in the database, or on delete/addition of the package.*

You may filter, or define using any of the optional registry properties:

**package**
  * name
  * enabled

**registry**
  - provides
  - route
  - template
  - icon
  - label
  - cycle
  - container

***Special Usage***
 - `cycle`  1- Core, 2- Stable, 3- Testing 4- Early
 - `container` group alike for presentation *example: used to connect settings on dashboard app card registry object*


**Dynamic Templates**

The `provides` property is a "placement" value, loading it as `dynamic template` where the other conditions match a request from the `reactionApps` helper.

The following `provides` values are defined in reaction-core:

 * widget
 * paymentMethod
 * shippingMethod
 * settings
 * shortcut
 * dashboard
 * console
 * userAccountDropdown

To add a new `settings` link to the app card:

```
    # settings
    {
      route: "dashboard/package/settings"
      provides: 'settings'
      icon: "fa fa-user-plus"
    }
```

To add a new link to the `console navbar`:

```
    {
      route: "<custom-route>"
      label: '<My Link>'
      provides: 'console'
    }
```

From templates, you can create additional dynamic template `provides` using the `reactionApps` helper to load registry objects.

```html
  {{#each reactionApps provides="settings" name=name group=group}}
    <a href="{{pathFor route}}" class="pkg-settings" title="{{i18n 'app.settings'}}">
      <i class="{{orElse icon 'fa fa-cog fa-2x fa-fw'}}"></i>
    </a>
  {{/each}}
```

**Widgets**

Add widgets to your package to be included on the `console dashboard` by including a registry entry and a template that provides 'widget'.

    <template name="reactionHelloworldWidget">
        <div class="dashboard-widget">
          <div class="dashboard-widget-center">
            <div>
              <h3 class="helloworld-text">Widget Panel</h3><small>your widget</small>
            </div>
          </div>
        </div>
    </template>

*See example: packages/reaction-core/client/templates/dashboard/orders/widget/widget.html*

*Tip: the `dashboard-widget` and `dashboard-widget-center` classes will create touch/swipeable widget boxes.*

Include in **server/register.coffee** registry:

```
    # order widgets
    {
      template: "reactionHelloworldWidget"
      provides: 'widget'
    }
```

You can also extend or replace any core template using [template extensions](https://github.com/aldeed/meteor-template-extension/).

#### Permissions

We use [alanning:roles](https://github.com/alanning/meteor-roles) for providing roles support.

**Permissions are grouped by `shopId`.**

Package specific roles can be defined in `register.coffee`, by adding custom permissions to registry entries with:

```coffeescript
      permissions: [
        {
          label: "Custom Permission"
          permission: "custom/permission"
        }
      ]
```

Permission of the current route and user are compared against the package route by default, adding specific permissions to the registry entry is optional.


##### Owner
The initial setup user was added to the shops 'owner' permission group with the 'owner' permission.

Users with "owner" role are full-permission, app-wide users.

**To check if user has owner access:**
```
	# client / server
	ReactionCore.hasOwnerAccess()

	# template
	{{#if hasOwnerAccess}}
```
##### Admin
Users with "admin" role are full-permission, site-wide users.
**To check if user has admin access:**
```
  # client / server
  ReactionCore.hasAdminAccess()

  # template
  {{#if hasAdminAccess}}
```

##### Dashboard
Users with "dashboard" role are limited-permission, site-wide users.

**To check if user has Dashboard access:**
```
  # client / server
  ReactionCore.hasDashboardAccess()

  # template
  {{#if hasDashboardAccess}}
```

To check if user has some specific permissions:

on Client: for current user, where "permissions" is string or ['string']

    ReactionCore.hasPermission(permissions)

on Server: for some shop (current if not defined) and some userId (current if not defined), where "permissions" is string or ['string']

    ReactionCore.hasPermission(permissions, shop, userId)

in templates:

    {{#if hasPermission permissions}}{{/if}}


For using shop permissions in some packages you must add it into register directive.
If we add this package then permissions will be available in Shop Accounts Settings.

Another example:

    ReactionCore.registerPackage
     name: 'reaction-commerce-orders'
     provides: ['orderManager']
     permissions: [
       {
         label: "Orders"
         permission: "dashboard/orders"
       }
     ]


###Routes
We use the [iron:router](https://github.com/iron-meteor/iron-router) package for managing routes.
Routes are created in `common/routing.coffee`

```
Router.map ->
  @route 'paypal',
    controller: ShopAdminController
    path: 'dashboard/settings/paypal',
    template: 'paypal'
    waitOn: ->
      return ReactionCore.Subscriptions.Packages
```

Use the controller `ShopController` for public/shop routes, and `ShopAdminController` for admin roles.

In addition to defining the route in the `Router.map`, you should add the route and template in the `ReactionCore.registerPackage` to export this route to ReactionCore and add permissions.

###Collections
We use the [AutoForm, collection2, simple-schema](https://github.com/aldeed/meteor-autoform) package for defining forms, collections and schemas.

You can extend core collections, schemas in your package. You can also create your own collections.

Example of extending a core schema:

```
ReactionCore.Schemas.BraintreePackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig
  {
    "settings.mode":
      type: Boolean
      defaultValue: false
    "settings.merchant_id":
      type: String
      label: "Merchant ID"
    "settings.public_key":
      type: String
      label: "Public Key"
    "settings.private_key":
      type: String
      label: "Private Key"
  }
])
```

###Security
These Meteor packages are installed by as dependencies.

**ongoworks/security**
**alanning:meteor-roles**
**audit-argument-checks**

Use [`check`](http://docs.meteor.com/#/full/check) for all `Meteor.methods` arguments. You can remove with `meteor remove audit-argument-checks` if necessary, but packages will be required to pass `check` to be accepted as Reaction packages.

**browser-policy**

The [browser-policy](https://atmospherejs.com/meteor/browser-policy) package lets you set security-related policies that will be enforced by newer browsers. These policies help you prevent and mitigate common attacks like cross-site scripting and clickjacking.

`browser-policy` is installed by reaction-core and is not optional.

##Publishing

You can develop, or even deploy with your packages in the `reaction/packages` directory. If you'd like to publically share the package, you'll need to publish it to the Meteor package registry.

To have your package included in a Reaction release, please create a GitHub issue.

See [meteor publish](http://docs.meteor.com/#/full/meteorpublish) for details on publishing to the Meteor package registry.

*We can fork and publish packages under the reactioncommerce organization if the packages are included, and a pull request is made in reaction-core or reaction application distribution.*

