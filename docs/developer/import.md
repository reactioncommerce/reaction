# Reaction Import
This provides some general importing infrastructure, to be used with more specific integration packages.

## Contributors
Thanks to Tom De Caluwé for his work on [Reaction Import](https://github.com/tdecaluwe/reaction-import)

## Contents
- [Architecture](#architecture)
  - [Importing from files](#importing-from-files)

- [Reference](#reference)
  - [`ReactionImport.flush`](#flush)
  - [`ReactionImport.tag`](#tag)
  - [`ReactionImport.product`](#product)
  - [`ReactionImport.process`](#process)

- [Image uploader](#image-uploader)

## Architecture
The package only exports one global variable, `ReactionImport`, and  is structured around an import buffer. This buffer is used to support fast bulk updates and inserts by sending all the queries at once to the database server. The import buffer can be filled with a number of webshop entities. Currently supported are:
- Tags
- Products
- Shops
- Packages
- Translations

All the import functions have a similar signature:

```javascript
ReactionImport.entity = function (key, value [, ...]) { ... }
```

The key is an object used to identify the product in the database (and is passed on directly as the first argument of the `db.collection.update()` call). This allows one to update the entity if it was already imported before. The value object contains any other values to be updated which do not identify the update. These functions are used to populate the import buffer, the only flush the buffer if it reaches a certain size. To force a buffer flush, call `ReactionImport.flush()`.

When importing entities which need to be referenced by other entities it is recommended to provide a custom unique `_id` value as the `key`, thus avoiding an extra query to obtain this `_id`.

### Choosing a suitable key
When importing documents that can be referenced by other documents, it might be a good idea to use the foreign key directly as the import key. Otherwise an extra query is needed to determine the foreign key, which in turn requires flushing the buffer.

### Importing from files
The package includes a helper function, [`ReactionImport.process`](#process), which accepts json arrays. It can be used to populate the database, importing some products might be as easy as:

```javascript
ReactionImport.process(Assets.getText(file), ['title'], ReactionImport.product);
```

## Reference
### `ReactionImport.flush()` <a name="flush"></a>
Read everything from the import buffer into the database.

### `ReactionImport.tag(key, value)` <a name="tag"></a>
As explained above, for importing tags it might be interesting to provide a suitable `_id` as the key:

```javascript
var tag;
...
ReactionImport.tag({ '_id': tag }, { 'name': tag, 'isTopLevel': true });
```

We can now directly use the `tag` value as a value in the `product.hashtags` array. If we didn't know the `_id` for our tag we'd need to commit the import buffer first and query for the tag with the key we provided, just to obtain this `_id`.

### `Import.product(key, value, parent)` <a name="product"></a>
The product import provides an extra optional argument `parent` to accomodate for the product hierarchy structure planned for reaction. Currently this extra argument is used to import a variant where `key` identifies the variant and `parent` identifies the product. When called with two arguments the function will import a product. An example:

```javascript
var title, description, tag, ean, price;
...
ReactionImport.product({ 'title': title }, { 'description': description, 'hashtags': [tag] });
ReactionImport.product({ 'ean': ean }, { 'price': price }, { 'title': title });
```

### `ReactionImport.process(json, key, callback)` <a name="process"></a>
Processes a json array with a given callback. The `key` argument should be used to pass an array containing the fields to be used as the import key.

The callback should accept two parameters: a key and the data to be imported. Usually this will be one of the `ReactionImport` entity import functions, although a custom callback can be used as well. A custom callback can, for example, be used to pass the parent key when importing products/variants.

## Image uploader
This package also includes a bulk image uploader as these often need to be uploaded separately when importing from an ERP solution. Currently a filename in the format `${product.variants.barcode}.[${priority}.]${extension}` is expected (where the priority is optional). Images will be used for the product if the priority is equal to zero, but will always show when the corresponding variant is consulted. This uploader can be accessed through the reaction dashboard.
