# Packages
Reaction packages are Meteor packages that add a call to `ReactionCore.registerPackage` declaring the package structure to the Reaction registry.

- [Core Packages](#core-packages)
- [Public packages](#public-packages)
- [Private packages](#private-packages)
  - [ReactionCore.registerPackage](#reactioncoreregisterpackage)
  - [Registry](#registry)
  - [Permissions](#permissions)
    - [Owner](#owner)
    - [Admin](#admin)
  - [Dashboard](#dashboard)
  - [Routes](#routes)
  - [Collections](#collections)
  - [Security](#security)
  - [Publishing](#publishing)

## Core Packages
For local core package development you must _git clone_ packages locally, either into `reaction/packages`, or define the `PACKAGE_DIRS` env variable for an alternate location.

The `bin/clone-packages.sh` is a helper script that will clone all current reactioncommerce:* packages into the PACKAGE_DIRS location.

First set your PACKAGE_DIRS variable:

```bash
export PACKAGE_DIRS="/Users/path/to/your/packages"
```

By default, if the `PACKAGE_DIRS` ENV variable is not set, we'll assume `PACKAGE_DIRS="~/reaction/packages"`.

Checkout Reaction and execute `clone-packages.sh`.

```bash
cd ~
git clone https://github.com/reactioncommerce/reaction.git
cd reaction
./bin/clone-packages.sh
meteor --settings settings/dev.settings.json
```

This is our recommended practice, and ensure you are working with the default branches (development) for all the Reaction packages.

_Note: Pull requests are happily accepted, please make your GitHub pull request a merge to the `development` branch, and not master._

_Tip: Copy the `settings/dev.settings.json` to `settings/settings.json` and edit the file to retain authentication and Meteor settings between `meteor reset`. Start with `meteor --settings settings/settings.json --raw-logs`_

## Public packages
If you create a package and would like to share it with the Meteor community, you can publish the package to the Meteor package registry with `meteor publish`.

_Publishing packages is not a requirement to share or deploy packages._

If you would like to share a package in the registry, but don't want to be responsible for long term ownership of the package, create an issue and let us know. We can also fork and maintain a [Reaction Commerce published org version of your package](https://atmospherejs.com/reactioncommerce).

## Private packages
Packages within Reaction are Meteor packages. There are private packages, that a developer can create to customize any of Reaction's functionality. Private packages can be deployed by including them in the `packages` folder.

**Create packages**

```
meteor create --package
```

See [Meteor docs](https://docs.meteor.com/#/full/writingpackages) for additional help creating packages.

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
  api.addFiles("server/register.js",'server');
});
```

Where name is the `org-user:packagename` that you will use to publish this package to the Meteor registry. See: [Meteor package.js docs](https://docs.meteor.com/#/full/packagejs).

Any files you create in your package you will need to add in your [package.js](https://docs.meteor.com/#/full/packagejs) file.

```javascript
api.addFiles('myfile');
```

To test your package, add it to your application :

```
meteor add your-new-package
```

_Tip: You can also add and remove packages by editing `.meteor/packages`_

### ReactionCore.registerPackage
The `ReactionCore.registerPackage` method describes a Meteor package to other Reaction packages.

Note: The registry entries load does not overwrite existing package entries in the `Packages` collection. However, if there is a package settings object, these entries will be refreshed on change. You'll need to either clear the `Packages` collection, or do a `meteor reset` to re-write other changes to a package registry entry.

Integrate packages with reaction-core by adding **server/register.js**

```javascript
ReactionCore.registerPackage({
  label: 'PayPal',
  name: 'reaction-paypal',
  autoEnable: false,
  registry: [
    {
      provides: 'dashboard',
      label: 'PayPal',
      description: 'PayPal Payment for Reaction Commerce',
      icon: 'fa fa-paypal',
      cycle: '3',
      container: 'reaction-paypal'
    }, {
      label: 'PayPal Settings',
      route: 'paypal',
      provides: 'settings',
      container: 'reaction-paypal',
      template: 'paypalSettings'
    }, {
      template: 'paypalPaymentForm',
      provides: 'paymentMethod'
    }
  ],
  permissions: [
    {
      label: 'PayPal',
      permission: 'dashboard/payments',
      group: 'Shop Settings'
    }
  ]
});
```

#### Registry
The registry is used to add settings, routes,  and permissions for Reaction specific packages.

A `registry` object can be any combination of properties, with `provides` being the only required element.

_Note: The registry is currently refreshed only on update/deleting the package record in the database, or on delete/addition of the package._

You may filter, or define using any of the optional registry properties:

**package**

```
ReactionCore.registerPackage({
  name: 'core',
  autoEnable: true,
  settings: {
    "public": {
      allowGuestCheckout: true
    },
    mail: {
      user: "",
      password: "",
      host: "localhost",
      port: "25"
    }
  },
```

**registry**

```
  registry: [
    {
      route: "dashboard/settings/shop",
      provides: 'dashboard',
      label: 'Core',
      description: 'Reaction Commerce Core',
      icon: 'fa fa-th',
      cycle: 1,
      container: "dashboard",
      permissions: [
        {
          label: "Dashboard",
          permission: "dashboard"
        }
      ]
    }, {
      route: "dashboard",
      provides: 'shortcut',
      label: 'Dashboard',
      icon: 'fa fa-th',
      cycle: 1
    }, {
      route: "dashboard",
      label: 'Dashboard',
      provides: 'console',
      permissions: [
        {
          label: "Console",
          permission: "console"
        }
      ]
    }, {
      route: "dashboard/settings/shop",
      template: "shopSettings",
      label: "Shop Settings",
      provides: 'settings',
      icon: "fa fa-cog fa-2x fa-fw",
      container: 'dashboard'
    }
  ]
```

**layout**

```
layout: [
  {
    template: "checkoutLogin",
    label: "Login",
    workflow: 'coreCartWorkflow',
    container: 'checkout-steps-main',
    audience: ["guest", "anonymous"],
    priority: 1,
    position: "1"
  }
]
```

For more details about layouts, and workflows see: [workflow.md](workflow.md)

**_Special Usage_**
- `cycle`  1- Core, 2- Stable, 3- Testing 4- Early
- `container` group alike for presentation _example: used to connect settings on dashboard app card registry object_

**Dynamic Templates**

The `provides` property is a "placement" value, loading it as `dynamic template` where the other conditions match a request from the `reactionApps` helper.

The following `provides` values are defined in reaction-core:
- widget
- paymentMethod
- shippingMethod
- settings
- shortcut
- dashboard
- console
- userAccountDropdown

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

You can also extend or replace any core template using [template extensions](https://github.com/aldeed/meteor-template-extension/).

#### Permissions
[alanning:roles](https://github.com/alanning/meteor-roles) package provides Reaction permissions support.

**Permissions are grouped by `shopId`.**

Package specific roles can be defined in `register.js`, by adding custom permissions to registry entries with:

```
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
Users with "admin" role are full-permission, site-wide users.<br>**To check if user has admin access:**

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

```
ReactionCore.hasPermission(permissions)
```

on Server: for some shop (current if not defined) and some userId (current if not defined), where "permissions" is string or ['string']

```
ReactionCore.hasPermission(permissions, shop, userId)
```

in templates:

```
{{#if hasPermission permissions}}{{/if}}
```

For using shop permissions in some packages you must add it into register directive.<br>If we add this package then permissions will be available in Shop Accounts Settings.

Another example:

```
ReactionCore.registerPackage
 name: 'reaction-commerce-orders'
 provides: ['orderManager']
 permissions: [
   {
     label: "Orders"
     permission: "dashboard/orders"
   }
 ]
```

### Routes
[Iron:router](https://github.com/iron-meteor/iron-router) provides routing in Reaction.

Routes are defined, both in app and packages. Most often found in `common/routers.js`.

```
Router.map ->
  this.route 'paypal',
    controller: ShopAdminController
    path: 'dashboard/settings/paypal',
    template: 'paypal'
    waitOn: ->
      return ReactionCore.Subscriptions.Packages
```

Use the controller `ShopController` for public/shop routes, and `ShopAdminController` for admin roles.

In addition to defining the route in the `Router.map`, you should add the route and template in the `ReactionCore.registerPackage` to export this route to ReactionCore and add permissions.

### Collections
[AutoForm, collection2, simple-schema](https://github.com/aldeed/meteor-autoform) packages provide functionality for defining forms, collections and schemas.

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

### Security
Community tested Meteor packages that enforce security rules are installed as required dependencies in Reaction Core.

**ongoworks/security**<br>**alanning:meteor-roles**<br>**audit-argument-checks**

Use [`check`](https://docs.meteor.com/#/full/check) for all `Meteor.methods` arguments.

You can remove with `meteor remove audit-argument-checks` if necessary, but packages will be required to pass `check` to be accepted as Reaction packages.

**browser-policy**

The [browser-policy](https://atmospherejs.com/meteor/browser-policy) package lets you set security-related policies that will be enforced by newer browsers. These policies help you prevent and mitigate common attacks like cross-site scripting and clickjacking.

`browser-policy` is installed by reaction-core and is not optional.

## Publishing
You can develop, or even deploy with your packages in the `reaction/packages` directory. If you'd like to publically share the package, you'll need to publish it to the Meteor package registry.

To have your package included in a Reaction release, please create a GitHub issue.

See [meteor publish](https://docs.meteor.com/#/full/meteorpublish) for details on publishing to the Meteor package registry.

_We can fork and publish packages under the reactioncommerce organization if the packages are included, and a pull request is made in reaction-core or reaction application distribution._
