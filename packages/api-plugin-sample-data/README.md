# api-plugin-sample-data

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-example.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-example)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-example.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-example)

## Summary

This plugin loads the database with sample data that gives the user an idea of how the Storefront would appear with the basic details. The data would also appear in the AdminUI. The sample data includes Account (default admin account), Shop data (includes basic shop data, sample shipping, sample payment), Product data (including variants and images), Tags & Navigation. Instructions to add additional data are also provided below.

#### Where is the sample data stored?
All of the initial set of data required by this plugin is present in the `/src/json-data` folder within this plugin. All files are in JSON format.

Additionally, we have the image files for the products stored in `/src/images` folder.
#### How to load the default sample data?
This plugin has to be explicitly added to your API and configured to load in the initial start-up. Apart from including this plugin, the other pre-requisites are:
* The LOAD_SAMPLE_DATA flag should be set to true in the .env file in the root API folder. Add a line `LOAD_SAMPLE_DATA=true`
* There should not be any existing Shop in the database

If any of the above two conditions turns out to be false, this plugin exits without making any changes to the database.

At this stage, the database is populated with the initial sample data and you may tweak around with it from the Admin UI. You may add new products, tags, navigation etc from the Admin UI as usual. But in case you want some additional data to be prepopulated along with the provided sample data, then you may follow the below steps to update the JSON files to include the additional data.

#### How to add additional data? 
For the purpose of the sample data, we are confining our requirement to a single account and shop. The details of the account and the shop are present in the following json files and are customizable (`/src/json-data/Accounts.json`, `/src/json-data/users.json` and `/src/json-data/Shops.json`). Also, the default shipping method is added via `/src/json-data/ShippingMethod.json`.

As for the remaining items (Products, Images, Tags, Navigation), let us walk through the steps to add them.

Let us add the Tag details first as this will be required before we publish the products.

##### 1. Adding a new Tag
Sample json for a new Tag is provided below. Please make a note of the object's key (menJacket) and the slug (men-jacket), as they will be used later in this plugin. Also the _name_ and _displayTitle_ is what the user would see in the UI as the bread-crumbs and title.

```
  "menJacket": {
    "name": "Men's Jacket",
    "slug": "men-jacket",
    "displayTitle": "Men's Jackets",
    "shopId": "",
    "isVisible": true
  }
```
Once the new tag is present in the Tags.json, we would need to modify the `/src/loaders/loadTags.js` to create an entry (similar to the one below) corresponding to the newly added tag. Here we have hard-coded the variable 'menJacket' to match the property key that we used above to create the tag.

`
  tagOutput.menJacket = await context.mutations.addTag(context.getInternalContext(), TagsData.menJacket);
`

The tag objects output from the `loadTags.js` is used later in the `loadProducts.js` to associate the products with the tags. For the association to happen, we need to create an entry in the `/src/json-data/TagProductMapping.json` also and this will be mentioned in the below section where we add products.

##### 2. Adding new Products
* For this sample-data plugin, we are considering products that have variants under them and in some examples we have one or more options under these variants. 
* The top level product will have `type: 'simple'` and also the ancestors property will be an empty array. 
* The variants and the options under the variants (if any) will have `type: 'variant'` and the ancestors property will be an array of productIds that defines the hierarchy of the Product.

The sample entry that we are adding now will be a top-level product (say Jacket), with variants categorized by 'Color' and 'Size'. Example, we will have:
```
Jacket
|
+-- Black (Color)
|   |
|   +-- Small (Size)
|   +-- Large (Size)
|
+-- Blue (Color)
    |
    +-- Small (Size)
    +-- Medium (Size)
```

_Special-case: 'price' property._

The 'price' property of leaf-level products would be of type 'Number' which contains the actual price of the product. The 'price' property will be an object for all the higher levels of the specific product (basically the top-level and all other variants). This object would contain properties such as range, max, min. This is to capture the max, min, and range of price values of all the products under that level.

In case of this sample data, for product entries of `type: 'simple'` we add price as an object. For product entries of `type: 'variant'` we shall insert price as a Number. Later, the 'afterVariantUpdate' event which is triggered inside this plugin will transform all the 'price' properties from Number to Object for those entries which are not leaf-level.


###### 2.a. Adding top-level product
Here is a sample json to add a new top-level product (Comments are only for additional info and must be removed before using this template).

```
{
    "_id": "DZwLHk4EAzitRni8F",    // provide NEW productId
    "ancestors": [],              // empty for top-level
    "createdAt": {
      "$date": "2022-01-05T15:01:34.445+0000"
    },
    "handle": "mens-jacket",
    "isDeleted": false,
    "isVisible": true,
    "shopId": "",       // this will be updated by the plugin dynamically
    "shouldAppearInSitemap": true,
    "supportedFulfillmentTypes": [
      "shipping"
    ],
    "title": "Men's Jacket",
    "type": "simple",         // 'simple' for top-level product
    "updatedAt": {
      "$date": "2022-01-21T16:53:32.010+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": {               // price as object for top-level
      "range": "49.99",
      "min": 49.99,
      "max": 49.99
    },
    "description": "Our new rain jacket is crafted with outdoor-inspired details in a city-ready package. Constructed in a durable three-layer waterproof stretch nylon fabric, our rain jacket will be your first line of defense against the elements.",
    "originCountry": "US",
    "currentProductHash": "3f262d57850e31fbccd2a6eb6a1bb92b1328a327",
    "facebookMsg": "Share our listing wth your friends on facebook using the link below www.facebook.com/mens-waterproof-outdoor-rain-jacket",
    "pinterestMsg": "Share our listing wth your friends on pinterest using the link below www.pinterest.com/mens-waterproof-outdoor-rain-jacket",
    "twitterMsg": "Share our listing wth your friends on twitter using the link below www.twitter.com/mens-waterproof-outdoor-rain-jacket",
    "pageTitle": null,
    "vendor": "Reaction Outdoor Apparel",
    "publishedAt": {
      "$date": "2022-01-21T16:53:32.010+0000"
    },
    "publishedProductHash": "3f262d57850e31fbccd2a6eb6a1bb92b1328a327",
    "hashtags": []
  }
```

###### 2.b. Adding Variants entries
Sample json for adding the variants 'Color' (entries Black & Blue). Please notice the _attributeLabel_ and _optionTitle_ properties. Also the ancestors property has the productId of the top-level product.
(Comments are only for additional info and must be removed before using this template)
```
  {
    "_id": "Hn4BRaBvLkYffMq36",           // provide NEW productId
    "ancestors": [                        // productId of the top-level
      "DZwLHk4EAzitRni8F"
    ],
    "createdAt": {
      "$date": "2022-01-05T15:01:34.457+0000"
    },
    "isDeleted": false,
    "isVisible": true,
    "shopId": "dSZqgQsyp48EpJzor",
    "type": "variant",                   // 'variant' for non-topLevel entries
    "updatedAt": {
      "$date": "2022-01-05T15:17:49.155+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": 49.99,                   // price as Number for non-topLevel entries
    "isTaxable": true,
    "attributeLabel": "Color",
    "height": 18,
    "length": 10,
    "optionTitle": "Black",
    "originCountry": "US",
    "title": "Men's Jacket - Black",
    "weight": 2.5,
    "width": 6,
    "compareAtPrice": 24.99,
    "taxCode": "USCA",
    "taxDescription": "California Tax"
  },
  {
    "_id": "ynNA5rXKZCHF2uKjq",           // provide NEW productId
    "ancestors": [                        // productId of the top-level
      "DZwLHk4EAzitRni8F"
    ],
    "createdAt": {
      "$date": "2022-01-05T15:38:57.021+0000"
    },
    "isDeleted": false,
    "isVisible": true,
    "shopId": "dSZqgQsyp48EpJzor",
    "type": "variant",                   // 'variant' for non-topLevel entries
    "updatedAt": {
      "$date": "2022-01-05T15:39:37.646+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": 49.99,                   // price as Number for non-topLevel entries
    "isTaxable": true,
    "attributeLabel": "Color",
    "height": 15,
    "length": 17,
    "optionTitle": "Blue",
    "originCountry": "US",
    "title": "Men's Jacket - Blue",
    "weight": 2.5,
    "width": 13,
    "compareAtPrice": 24.99
  }
```
###### 2.c. Adding Leaf-level entries
Sample json for adding leaf-level entries under Color-Black with variant type as Size (values Small, Large etc). The 1st entry in the ancestors property is the top-level product and the 2nd entry is the variant with Color = Black ("Hn4BRaBvLkYffMq36"). Please notice the _attributeLabel_ and _optionTitle_ properties. 
(Comments are only for additional info and must be removed before using this template)

```
  {
    "_id": "4JS386GgmvrxgyooS",           // provide NEW productId
    "ancestors": [                        // productId of the top-level and sublevel
      "DZwLHk4EAzitRni8F",
      "Hn4BRaBvLkYffMq36"
    ],
    "createdAt": {
      "$date": "2022-01-06T15:50:33.008+0000"
    },
    "isDeleted": false,
    "isVisible": true,
    "shopId": "dSZqgQsyp48EpJzor",
    "type": "variant",                   // 'variant' for non-topLevel entries
    "updatedAt": {
      "$date": "2022-01-06T15:54:56.478+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": 49.99,                   // price as Number for non-topLevel entries
    "attributeLabel": "Size",
    "height": null,
    "length": null,
    "optionTitle": "Small",
    "originCountry": "US",
    "title": "Men's Jacket - Black Small",
    "weight": null,
    "width": null
  },
  {
    "_id": "MShhiNKGYqyR68ZF7",           // provide NEW productId
    "ancestors": [                        // productId of the top-level and sublevel
      "DZwLHk4EAzitRni8F",
      "Hn4BRaBvLkYffMq36"
    ],
    "createdAt": {
      "$date": "2022-01-06T15:51:11.147+0000"
    },
    "isDeleted": false,
    "isVisible": true,
    "shopId": "dSZqgQsyp48EpJzor",
    "type": "variant",                   // 'variant' for non-topLevel entries
    "updatedAt": {
      "$date": "2022-01-06T15:54:58.299+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": 49.99,                   // price as Number for non-topLevel entries
    "attributeLabel": "Size",
    "height": null,
    "length": null,
    "optionTitle": "Large",
    "originCountry": "US",
    "title": "Men's Jacket - Black Large",
    "weight": null,
    "width": null
  }
```
Sample json for adding leaf-level entries under Color-Blue with variant type as Size (values Small, Medium etc). The 1st entry in the ancestors property is the top-level product and the 2nd entry is the variant with Color = Blue ("ynNA5rXKZCHF2uKjq"). Please notice the _attributeLabel_ and _optionTitle_ properties.

```
  {
    "_id": "je2NxNaHzghJSFNin",           // provide NEW productId
    "ancestors": [                        // productId of the top-level and sublevel
      "DZwLHk4EAzitRni8F",
      "ynNA5rXKZCHF2uKjq"
    ],
    "createdAt": {
      "$date": "2022-01-06T15:54:03.957+0000"
    },
    "isDeleted": false,
    "isVisible": true,
    "shopId": "dSZqgQsyp48EpJzor",
    "type": "variant",                   // 'variant' for non-topLevel entries
    "updatedAt": {
      "$date": "2022-01-19T23:43:39.335+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": 49.99,                   // price as Number for non-topLevel entries
    "attributeLabel": "Size",
    "height": null,
    "length": null,
    "optionTitle": "Small",
    "originCountry": "US",
    "title": "Men's Jacket - Blue Small",
    "weight": null,
    "width": null
  },
  {
    "_id": "YGQdZoXEcYBMCrfcJ",           // provide NEW productId
    "ancestors": [                        // productId of the top-level and sublevel
      "DZwLHk4EAzitRni8F",
      "ynNA5rXKZCHF2uKjq"
    ],
    "createdAt": {
      "$date": "2022-01-06T15:54:20.828+0000"
    },
    "isDeleted": false,
    "isVisible": true,
    "shopId": "dSZqgQsyp48EpJzor",
    "type": "variant",                   // 'variant' for non-topLevel entries
    "updatedAt": {
      "$date": "2022-01-06T15:55:32.251+0000"
    },
    "workflow": {
      "status": "new"
    },
    "price": 49.99,                   // price as Number for non-topLevel entries
    "attributeLabel": "Size",
    "height": null,
    "length": null,
    "optionTitle": "Medium",
    "originCountry": "US",
    "title": "Men's Jacket - Blue Medium",
    "weight": null,
    "width": null
  }
```

Now that we have the product details available, we could complete the entry in the `/src/json-data/TagProductMapping.json` that we mentioned earlier in the '1. Add Tags' section. Since our new product maps to the tag 'menJacket' we should be adding an entry (top-level productId "DZwLHk4EAzitRni8F") to the array of products of the specific tag.

##### 3. Adding NavigationItem

We should be creating a NavigationItem entry in the `/src/json-data/NavigationItems.json` similar to the sample provided below. The value property is what gets displayed on the Storefront UI navigation. The url has to follow the specific format `/tag/<slug_of_the_tag>`. Here we want the NavigationItem to point to the Men's Jacket. That particular product is tagged with a tag entry 'menJacket' which has the slug as 'men-jacket'. So our url value would be _/tag/men-jacket_

```
  "MenuOneLeafLevel": {
    "draftData": {
      "classNames": null,
      "content": [
        {
          "language": "en",
          "value": "Men's Jacket"
        }
      ],
      "isUrlRelative": true,
      "shouldOpenInNewWindow": false,
      "url": "/tag/men-jacket"
    }
  }
```

##### 4. Updating NavigationTree
Navigation structure can be as complex or simple as we need it to be. In our sample-data, we are defining few top-level entries (like Men/Women/Unisex) and sub-levels under them (like Men's Outdoors, Women's Outdoors) and leaf-level entries (like Men's Jacket). Updating Navigation tree via code involves extensive hardcoding as detailed in `/src/loaders/loadNavigation.js`. The steps are:
* Create a NavigationItem object by calling the mutaion (createNavigationItem) and providing the NavigationItem data from the above created entry inside `/src/json-data/NavigationItems.json` .
* This NavigationItem object is updated with the function '_getNavigationItem_'.
* The NavigationItem under each level of Navigation is defined by the '_items_' property of the that level. Hence we have to add our new NavigationItem entry to the items of the level above it.

The above steps translate to the below code (for reference)
```
  const navItemMenuOneLeafLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuOneLeafLevel
  });


  let m1leaf = getNavigationItem(navItemMenuOneLeafLevel._id);

  m1sub.items = [m1leaf];

```
Inside  `/src/loaders/loadNavigation.js` we can see how this sub-level (`m1sub`) is subsequently added to the _items_ array which in turn is added to the top-level of Navigation. 

The navigation changes are publshed via the _publishNavigationChanges_ mutation and the Shops collection is updated with the _navigationTreeId_.

##### 5. Adding Images to the product

We could add one (or more) images for each of the leaf-level entries mentioned in the Products.json. But for the simplicity of this sample-data, we are only adding images at the variant-level. This would mean that all of the leaf-level items under a variant would have the same set of images.

To explain with an example, we have 'Jackets' as top-level product, variants as 'Black'/'Blue' and leaf-level entries as Small/Medium/Large. So in effect, we will have the same set of images for all the sizes (small/medium/large) under each Color.

Once we have identified the productID (_id) of the variant entries, we just need to update the file-name to include the productId at the begining of the file-name followed by a period '.'. So the specific format of the image would be `productID.<rest_of_file_name>.<extn>`. Allowed image file extensions are jpg/jpeg/png. Once the image with the updated file-name is ready, we just need to place the file in the `/src/images` folder.

Note: We have hard-coded the path to the images folder inside `/src/loaders/loadImages.js` as follows `  let folderPath = "./custom-packages/api-plugin-sample-data/src/images/"`
By default, when a new plugin is added, the above mentioned path would be correct, but in case we have the plugin folder under a different name, we need to make sure that the above folderPath is updated to match the actual location.
The `/src/loaders/loadImages.js` script will update the product images to the database and publish the product. The details of the parent productId which is required by the `loadImages.js` is pulled from the Products.json that we updated initially with product data.

#### Conclusion
At this stage, we have all the data that we need to update the database. We could start the API with api-sample-data-plugin enabled and the LOAD_SAMPLE_DATA flag set to true in .env file.


#### Login info (for the adminUI) 

username: admin@example.org
password: password

## Included in this example plugin

### `.circleci/`

Adds CI scripts that enable Circle CI to run tests and lint your project.

### `src/`

The `src` folder is where you'll put all the plugin files. An `index.js` with a bear-bones `registerPlugin` is included.

### `.gitignore`

A basic `gitignore` file

### `.nvmrc`

`.nvmrc` sets your plugin to use Node v12.14.1

### `babel.config.cjs`

If your plugin includes linting and tests, this file is required to allow esmodules to run correctly.

### `jest.config.cjs`

If your plugin includes tests, this file is required to allow esmodules to run correctly. You'll need to update the `transformIgnorePatterns` and `moduleNameMapper` sections to include any esmodule `npm` packages used in your plugin.

### `License.md`

If your plugin uses `Apache 2` licensing, you can leave this file as-is. If another type of licensing is used, you need to update this file, and the README, accordingly.

### `package.json`

The provided `package.json` is set up to install all needed packages and config for linting and testing. You'll need to update the `name`, `description`, and add any new dependencies your plugin files use.

### `index.js`

The entrypoint file for your npm package, will most likely just export your plugin registration from the `src` folder.

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
