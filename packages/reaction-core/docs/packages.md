#Package Development

#Core packages

Clone packages locally, then in your local checkout of the reaction repo

    mrt link-package path/to/foo

Where "path/to/foo" is the path to the local repo of the package you with to work on locally.


# New packages

    mrt create-package [path/to/]foo


See [Meteorite docs](https://github.com/oortcloud/meteorite/) for additional help creating local packages.

Tip:  if you are cloning reaction-helloworld to start working on a new project, don't forget to add to the meteor package list.

    meteor add your-new-package

##Dashboard
Add packages to the reaction dashboard by adding **register.coffee**

    Meteor.app.packages.register(
      name: "reaction-helloworld"
      depends: [] #reaction packages
      label: "HelloWorld"
      description: "Example Reaction Package"
      icon: "fa fa-globe"
      priority: "2"
      overviewRoute: 'helloworld'
      hasWidget: true
      shopPermissions: [
        {
          label: "HelloWorld"
          permission: "/helloworld"
          group: "Hello World"
        }
    )

There are three elements to the "dashboard" view for packages.

- Package Panel: the left most box in the dashboard panel
- Package Widgets: - this is everything to the right of the panel and would be typical a group of graphs,etc
- Package Page: the area below the dashboard navigation bar, which can be used any content
 

Add widgets to your package to be included on the dashboard by including a template named packagename-widget

    <template name="reaction-helloworld-widget">
        <div class="dashboard-widget">
          <div class="dashboard-widget-center">
            <div>
              <h3 class="helloworld-text">Widget Panel</h3><small>See: client/dashboard/widgets</small>
            </div>
          </div>
        </div>
    </template>

Tip: the dashboard-widget and dashboard-widget-center classes will create touch/swipeable widget boxes.

##Roles/Permissions System

###Roles
We use https://github.com/alanning/meteor-roles for providing roles.
Users with "admin" role are full-permission, site-wide users. Package specific roles can be defined in register.coffee

###Permissions
Shop has owner, which determine by "ownerId" field in Shop collection.

**To check if user has owner access:**

on client: for current user

    Meteor.app.hasOwnerAccess()

on server: for some shop (current if not defined) and some userId (current if not defined)

    Meteor.app.hasOwnerAccess(shop, userId)

in templates: for current user

    {{#if hasOwnerAccess}}{{/if}}

**Shop has members, which can be admin and have permissions**

If member is admin next methods will always return `true`

To check if user has some specific permissions:

on Client: for current user, where "permissions" is string or [string]

    Meteor.app.hasPermission(permissions)

on Server: for some shop (current if not defined) and some userId (current if not defined), where "permissions" is string or [string]

    Meteor.app.hasPermission(permissions, shop, userId)

in templates:

    {{#if hasShopPermission permissions}}{{/if}}


For using shop permissions into some packages you must add it into register directive.
If we add this package then permissions will be available in Shop Accounts Settings.

    Meteor.app.packages.register
     name: 'reaction-commerce-orders'
     provides: ['orderManager']
     label: 'Orders'
     overviewRoute: 'shop/orders'
     hasWidget: false
     shopPermissions: [
       {
         label: "Orders"
         permission: "dashboard/orders"
         group: "Shop Management"
       }
     ]
