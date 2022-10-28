# api-plugin-authorization-simple

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-authorization-simple.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-authorization-simple)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-authorization-simple.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-authorization-simple)

## Summary

This plugin checks authorization in the Reaction API.

Authorization is determined by one primary function, `validatePermissions`, which is added onto the `context`. If permissions are valid, nothing will happen when this function is called. If permissions are invalid, this call will throw an `"Access Denied"` error.

A secondary function, `userHasPermission`, is also available on the `context`. This will provide a boolean value of the permission status.

`validatePermissions` is our preferred method.

## Usage

`permissions` are attached to account `Groups`, initially by being copied from [defaultRoles.js](https://github.com/reactioncommerce/reaction/blob/trunk/src/core-services/account/util/defaultRoles.js) on startup. Each account can belong to as may groups as needed (including not belonging to any group), and is granted *all* `permissions` from *all* the groups they belong to. This package provides the function `permissionsByUserId` which does the work to build a list of all the `permissions` the user is granted.

### Checking permissions

The `validatePermissions` function (and `userHasPermission`) takes three parameters: `resource`, `action`, and `context`. For example, this call is checking to see if the current user has permission to `cancel an item` on this particular order:

```js
await context.validatePermissions(`reaction:legacy:orders:${order._id}`, "cancel:item", {
  shopId: order.shopId,
  owner: order.accountId
});
```

#### Resource

Resource is the name of the resource a user is trying to access. This consists of three required pieces: `organization`, `system`, `entity`; and one optional field: `id`.

For our purposes in Reaction code:

- `organization` will always be `reaction`.
- `system` is the service or group of services that provide the resource we want to access control. It will always be `legacy` if the code lives within the Reaction API project, and will be the package name (i.e. `simple-authorization`) if the code live outside of the Reaction API project.
- `entity` is the actual data entity to access control, such as an `orders`. Entity names are always plural.
- `id`  is the actual ID of a data entity to access control. This is for super granular Policies and will most of the time be omitted or described with just a * meaning "all IDs".

#### Action

The action the user would like to preform. This can be anything, but we recommend sticking short, intentional words, which can be package-spaced if desired. For example, `create`, `read`, `update`, `delete`, and `publish` are all great actions. If you need more context, `remove:addressBook` would be a good name for the permission to remove `addressBooks` from an `account`, but not have `remove` privileges on the entire `account`.

#### Context

Context is used to pass any extra information to the permissions check. We use it primarily for two things at this time:

1. We pass `shopId` in the context (somtimes referred to as `ketoContext`) everywhere it's avaialble
1. We pass `owner` into the context anywhere where a regular, non-admin user is allowed permissions to something they themselves own. For example, on an order they placed, they will have `owner` permissions on that particular order.

## Under the hood

- `userHasPermission` is built from `getHasPermissionFunctionForUser`, which is registered to `context` as a `functionsByType` in its respective package, and called `userHasPermission` on `context` ([See code here](https://github.com/reactioncommerce/reaction/blob/8b3d66d758c8fe0e2ba1df1958767587ddb7a046/src/core/util/buildContext.js#L28-L42)). This plugin will work alongside any other authorization plugin registered in the same way.

- `validatePermissions` ([See code here](https://github.com/reactioncommerce/reaction/blob/8b3d66d758c8fe0e2ba1df1958767587ddb7a046/src/core/util/buildContext.js#L46-L49)), is created from the value of `context.userHasPermission`, If `userHasPermissions === true`, `validatePermissions` does nothing, and lets the rest of the function continue to run. If `userHasPermission === false`, `validatePermissions` throws an `Access Denied` error.

## Using this package
Import this package into the [registerPlugins.js](https://github.com/reactioncommerce/reaction/blob/8b3d66d758c8fe0e2ba1df1958767587ddb7a046/src/registerPlugins.js) file in the Reaction API, and then await its `registerPlugin` function:

```js
import registerSimpleAuthorizationPlugin from "@reactioncommerce/api-plugin-authorization-simple/index.js";
await registerSimpleAuthorizationPlugin(app);
```

## Developer Certificate of Origin
We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) in lieu of a Contributor License Agreement for all contributions to Reaction Commerce open source projects. We request that contributors agree to the terms of the DCO and indicate that agreement by signing all commits made to Reaction Commerce projects by adding a line with your name and email address to every Git commit message contributed:
```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

You can sign your commit automatically with Git by using `git commit -s` if you have your `user.name` and `user.email` set as part of your Git configuration.

We ask that you use your real name (please no anonymous contributions or pseudonyms). By signing your commit you are certifying that you have the right have the right to submit it under the open source license used by that particular Reaction Commerce project. You must use your real name (no pseudonyms or anonymous contributions are allowed.)

We use the [Probot DCO GitHub app](https://github.com/apps/dco) to check for DCO signoffs of every commit.

If you forget to sign your commits, the DCO bot will remind you and give you detailed instructions for how to amend your commits to add a signature.

## License
   Copyright 2020 Reaction Commerce

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
