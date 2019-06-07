---
id: blocks-api
title: Blocks API
---

The Blocks API is a method of component extension that allows for adding additional UI components into various regions across the admin interface. For example, you can add additional fields to the product editor to extend it's functionality without having to override the entire component or package.

See [Full API docs](#api) below.

## Using Reaction Blocks

A small subset of blocks and regions have been registered and can be imported .....

```jsx
import { Blocks } from "@reactioncommerce/reaction-components";

const MyCustomPage = (props) => (
  <div>
    <h1>My Page Title</h1>

    <div>
      <Blocks region="MyCustomPage" blockProps={props} />
      <Blocks region="ProductDetailMain" blockProps={props} />
    </div>
  </div>
);
```

The above example creates two Block Region called `MyCustomPage` and `ProductDetailMain`. Any components registered to this region will be rendered in order of their priority. The `ProductDetailMain` Block Region will contain components registered for the `ProductDetailMain` Block Region, which you can see when viewing the Product editor.

## Replacing Blocks

Registered blocks can be replaced with the `replaceBlock` method. This will replace the Block component and it will inherit any higher order components (HOC) that might be wrapping the original Block component (more detail on HOCs below).

```jsx
import { replaceBlock } from "@reactioncommerce/reaction-components";

const MyCustomProductDetailForm = (props) => (
  <div>Custom product detail form...</div>
);

replaceBlock({
  region: "ProductDetailMain",
  block: "ProductDetailForm",
  component: MyCustomProductDetailForm
});
```

## Registering Blocks

You also may want to register your own custom Block components in your plugin so that other users may override them in the same way we did above. For example, if you're writing a plugin for Reaction that adds additional fields to the product editor, you can add your fields into every product editor. You can register your Block components with the same `registerBlock` method that Reaction uses internally to register all of the core Block components.

```jsx
import { registerBlock } from "@reactioncommerce/reaction-components";

const MyExtraProductFields = (props) => (
  <div>
    custom things...
  </div>
);

registerBlock({
  region: "ProductDetailMain",
  name: "MyExtraProductFields", // Block name
  component: MyExtraProductFields,
  priority: 15
});
```

## Higher Order Components (HOCs)

To understand how Blocks works in Reaction, it's important to understand what higher order components (HOCs) are and how they interact with UI (presentational) components. If this is the first time you're hearing about higher order components, we recommend you read some or all of the following items to get familiar with this pattern of writing React components.

- Official React docs <https://facebook.github.io/react/docs/higher-order-components.html>
- Higher Order Components in React <https://spin.atomicobject.com/2017/03/02/higher-order-components-in-react/>
- A Gentle Introduction to React's Higher Order Components <https://www.robinwieruch.de/gentle-introduction-higher-order-components/>
- Recompose (a handy library of HOCs that we use in Reaction) <https://github.com/acdlite/recompose/blob/master/docs/API.md>

A higher order component's role is essentially to wrap another component and pass it props that help it to render what you want in the UI. This could be a list of items from the database, the current user, info about the current route, etc.

In Reaction, HOCs are added either at the point when components are registered or when you are replacing an existing component.

For example, this is how we pass the `currentUser` object to the `MyExtraProductFields` Block component in the `ProductDetailMain` Block Region:

```js
registerBlock({
  region: "ProductDetailMain",
  name: "MyExtraProductFields", // Block name
  component: MyExtraProductFields,
  hocs: [withCurrentUser];
});
```

When the `MyExtraProductFields` Block renders, it will have a prop called `currentUser` that includes the user object for the person currently viewing the page (assuming they're logged in). We can then use that to do things like customize the fields in this block based on user information.

Now if you wanted to customize that `MyExtraProductFields` Block Component, but you still want to have that user data available, all you have to do is use `replaceBlock`. That will only replace the Block Component and the `withCurrentUser` HOC will remain in place to inject the same user data on the `currentUser` prop as mentioned above. This allows you to customize how a Block Component looks while not having to re-implement how it gets its data or event handlers.

```js
const MyCustomExtraProductFields = ({ currentUser }) => (
  <ul>
    <li>{currentUser.name}</li>
    <li>...</li>
  </ul>
);

replaceComponent("MainDropdown", MyCustomDropdown);
```

You can also add additional HOCs when replacing a UI component. The final wrapped component will inherit the original HOCs and also add your new HOC(s). For example, we can add the `withIsAdmin` HOC to our custom dropdown:

```js
const MyExtraProductFields = ({ currentUser, isAdmin }) => (
  <ul>
    <li>{currentUser.name}</li>
    <li>...</li>
    {isAdmin &&
      <li>
        <Link to={"/admin/stuff"}>Secret Stuff</Link>
      </li>
    }
  </ul>
);

replaceBlock({
  region: "ProductDetailMain",
  block: "MyExtraProductFields",
  component: MyExtraProductFields,
  hocs: [withIsAdmin]
});
```

As you can see above, the `withCurrentUser` HOC was inherited from the original dropdown and we've added the `withIsAdmin` HOC to it.

## API

Below is the full API for the Reaction components system. Each of these items can be imported from `@reactioncommerce/reaction-components`.

### [Blocks Component & Object](#blocks-objects)

- [`Blocks`](#blocks)
- [`BlocksTable`](#blockstable)

### [Methods](#methods)

- [`registerBlock()`](#registerblock)
- [`replaceBlock()`](#replacecblock)
- [`getBlock()`](#getblock)
- [`getRawBlock()`](#getrawcomponent)
- [`registerBlockHOC()`](#registerblockhoc)
- [`getBlockHOCs()`](#getblockhocs)
- [`copyBlockHOCs()`](#copyblockhocs)
- [`loadRegisteredBlocks()`](#loadregisteredblocks)

### [Registered Blocks](#registeredblocks)

- [`Product Detail`](#productdetail)
- [`Variant Detail`](#variantdetail)

## Blocks Component & Object

### Blocks

This is the main `Blocks` Component which is used to register a Block Region. All Blocks registered to the specified region will be rendered in the order of their priority.

```jsx
import { Blocks } from "@reactioncommerce/reaction-components";

const MyCustomPage = (props) => (
  <div>
    <h1>My Page Title</h1>

    <div>
      <Blocks region="MyCustomPage" blockProps={props} />
      <Blocks region="ProductDetailMain" blockProps={props} />
    </div>
  </div>
);

// Or with a render prop

const MyCustomPage = (props) => (
  <div>
    <h1>My Page Title</h1>

    <div>
      <Blocks region="ProductDetailMain" blockProps={props}>
        {(blocks) =>
          blocks.map((block, index) => (
            <div className={props.classes.block} key={index}>
              {block}
            </div>
          ))
        }
      </Blocks>
    </div>
  </div>
);
```

### BlocksTable

This is where all of the separate pieces of a Block Component are stored. You will likely never need to access this object directly because the methods below provide a way to access every item in the object in a simple way.

The structure of a single Block Component in the table looks like this:

```jsx
BlocksTable.RegionName.BlockName = {
  region: "RegionName"
  name: "BlockName"
  hocs: [fn1, fn2],
  rawComponent: MyComponent,
  priority: 25
}
```

Again, this is just for reference, use the methods below to get/set whatever you need from that table.

## Methods

### registerBlock()

```jsx
import { registerBlock } from "@reactioncommerce/reaction-components";

const MyExtraProductFields = (props) => (
  <div>
    custom things...
  </div>
);

registerBlock({
  region: "ProductDetailMain",
  name: "MyExtraProductFields",
  component: MyExtraProductFields,
  priority: 15
});
```

or the same thing, but with a few HOCs

```jsx
import { registerBlock, withCurrentUser, withIsAdmin } from "@reactioncommerce/reaction-components";

const MyExtraProductFields = ({ currentUser, isAdmin }) => (
  <div>
    ID: {currentUser._id}
    name: {currentUser.name}
    {isAdmin &&
      <div>
        Top Secret Stuff!
      </div>
    }
  </div>
);

registerBlock({
  region: "ProductDetailMain",
  name: "MyExtraProductFields",
  component: MyExtraProductFields,
  priority: 15,
  hocs: [
    withCurrentUser,
    withIsAdmin
  ]
});
```

### replaceBlock()

```jsx
import { replaceBlock } from "@reactioncommerce/reaction-components";

const MyCustomProductDetailForm = (props) => (
  <div>Custom product detail form...</div>
);

replaceBlock({
  region: "ProductDetailMain",
  block: "ProductDetailForm",
  component: MyCustomProductDetailForm
});
```

### getBlock()

This is used to get a single Block Component.

```jsx
import { getBlock } from "@reactioncommerce/reaction-components";

const MyExtraProductFields = getBlock(
  "ProductDetailMain", // Region name
  "MyExtraProductFields" // Block name
);

const MyComponent = (props) => (
  <div>
    <MyExtraProductFields />
  </div>
);
```

### getBlocks()

This is used to get an array Block Components. This is equivalent to importing `Blocks` like we did above and using `<Blocks region="SomeName" />`.

```jsx
import { getBlocks } from "@reactioncommerce/reaction-components";

const ProductDetailMainBlocks = getBlocks("ProductDetailMain");

const MyComponent = (props) => (
  <div>
    <ProductDetailMainBlocks />
  </div>
);
```

### getRawBlock()

This gets the plain presentational Block Component without any HOCs wrapping it. You will be responsible for any props these raw component require to function properly.

```jsx
import { getRawBlock } from "@reactioncommerce/reaction-components";

const MyExtraProductFields = getRawBlockComponent(
  "ProductDetailMain", // Region name
  "MyExtraProductFields" // Block name
);

const MyComponent = (props) => (
  <div>
    <MyExtraProductFields />
  </div>
);
```

### registerBlockHOC()

It is generally recommended that you register any higher order components at the same time you register your presentational Block Components, but this method exists so that you have the option to only register a HOC and leave the Block Component alone. Note that this _adds_ your HOCs and does **not** replace the existing ones.

Considering that a HOC injects things on props, this method will not be likely be useful for most cases (since you have to update the Block Component to use the new props). However, one valid use case for this is render hijacking. For example, you might add a HOC that decides whether to render the child Block Component based on conditions outside of the component. In that case, the Block Component doesn't need to do anything with props.

```jsx
import { registerBlockHOC } from "@reactioncommerce/reaction-components";

function withConditionalRender(component) {
  // some logic that decides whether to render the child component
}

registerBlockHOC(
  "ProductDetailMain", // Region name
  "MyExtraProductFields", // Block name
  [withConditionalRender] // HOCs
);
```

### getBlockHOCs()

This gets the array of higher order components from an existing Block Component. One possible use case it to use a set of HOCs on another Block Component. However, depending on your use case, `copyBlockHOCs` (see below) may be a better fit.

```jsx
import { getBlockHOCs, registerBlock } from "@reactioncommerce/reaction-components";

const ProductDetailFormHOCs = getBlockHOCs({
  region: "ProductDetailMain",
  block: "ProductDetailForm",
});

const MyExtraProductFields = (props) => (
  <div>
    ...
  </div>
);

registerBlock({
  region: "ProductDetailMain",
  name: "MyExtraProductFields",
  hocs: [ProductDetailFormHOCs]
});
```

### copyBlockHOCs()

Similar to `getBlockHOCs` above, except this takes the higher order components from another Block Component and wraps a new Block Component that you provide.

```jsx
import { copyBlockHOCs, registerBlock } from "@reactioncommerce/reaction-components";

const MyExtraProductFields = (props) => (
  <div>
    ...
  </div>
);

const MyExtraProductFieldsBlockWithHOCs = copyBlockHOCs(
  "ProductDetailMain", // Source region name
  "ProductDetailForm", // Source block name
  MyExtraProductFields // React component
);
```

### loadRegisteredBlocks()

Used to wrap/load all registered Block Components on app startup. This generally should be run right before the router assembles the app tree so that all components are available for the UI. This is run by Reaction internally, so no third parties should ever need to use it.

```js
import { loadRegisteredBlocks } from "@reactioncommerce/reaction-components";

Meteor.startup(() => loadRegisteredBlocks());
```

## Registered Blocks

### Product Detail

All blocks inherit props from the `withProduct` HOC.

| Region               | Block               | HOCs              | Priority |
|----------------------|---------------------|-------------------|----------|
| ProductDetailSidebar | VariantList         |                   | 10       |
| ProductDetailHeader  | ProductHeader       |                   | 10       |
| ProductDetailMain    | ProductDetailForm   | [withProductForm] | 10       |
| ProductDetailMain    | ProductMediaForm    |                   | 20       |
| ProductDetailMain    | ProductSocialForm   | [withProductForm] | 30       |
| ProductDetailMain    | ProductTagForm      |                   | 40       |
| ProductDetailMain    | ProductMetadataForm | [withProductForm] | 50       |
| ProductDetailMain    | VariantTable        |                   | 60       |

### Variant Detail

All blocks inherit props from the `withProduct` and `withVariant` HOC.

| Region               | Block                | HOCs              | Priority |
|----------------------|----------------------|-------------------|----------|
| VariantDetailSidebar | VariantList          |                   | 10       |
| VariantDetailHeader  | VariantHeader        |                   | 10       |
| VariantDetailMain    | VariantDetailForm    | [withVariantForm] | 10       |
| VariantDetailMain    | VariantMediaForm     | [withVariantForm] | 20       |
| VariantDetailMain    | VariantTaxForm       | [withVariantForm] | 30       |
| VariantDetailMain    | VariantInventoryForm | [withVariantForm] | 30       |
| VariantDetailMain    | OptionTable          | [withVariantForm] | 40       |
