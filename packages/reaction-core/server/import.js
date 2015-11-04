ReactionImport = {};

ReactionImport._collections = ['Tags', 'Products'];
ReactionImport._buffers = {};
ReactionImport._contexts = {};
ReactionImport._count = 0;
ReactionImport._limit = 1000;

for (let collection of ReactionImport._collections) {
  ReactionImport._buffers[collection] = ReactionCore.Collections[collection].rawCollection().initializeUnorderedBulkOp();
}

/**
 * @summary Commit all buffers to the database.
 */
ReactionImport.flush = function () {
  for (let collection of ReactionImport._collections) {
    try {
      ReactionImport._buffers[collection].execute(function(error, result) {});
    } catch (error) {}
    ReactionImport._buffers[collection] = ReactionCore.Collections[collection].rawCollection().initializeUnorderedBulkOp();
  }
  ReactionImport._count = 0;
}

/**
 * @summary Store a product in the import buffer.
 * @param {Object} key A key to look up the product
 * @param {Object} product The product data to be updated
 * @param {Object} parent A key to identify the parent product
 * 
 * When processing the import buffer, the product and the parent will be
 * inserted if needed. Importing a variant currently consists of the following
 * steps:
 *
 * * Pull the variant from non-matching parent products.
 * * Push the variant if it doesn't exist.
 * * Update the variant.
 */
ReactionImport.product = function (key, product, parent) {
  if (parent) {
    ReactionCore.Schemas.ProductVariant.clean(product, {});
    if (ReactionImport._contexts.ProductVariant) {
      ReactionImport._contexts.ProductVariant.validate(product, {});
    } else {
      ReactionImport._contexts.ProductVariant = ReactionCore.Schemas.ProductVariant.newContext();
    }
    // Remove variants with the same key from other parents.
    ReactionImport._buffers['Products'].find({
      'variants': { $elemMatch: key },
      $nor: [ parent ]
    }).update({ $pull: { 'variants': { $elemMatch: key } } });
    // Make sure the variant exists.
    query = { $nor: [ { 'variants': { $elemMatch: key } } ] };
    for (let key of Object.keys(parent)) {
      query[key] = parent[key];
    }
    ReactionImport._buffers['Products'].find(query).update({ $push: { 'variants': key } });
    // Upsert the variant.
    ReactionCore.Schemas.ProductVariant.clean(product, {});
    query = { 'variants': { $elemMatch: key } };
    for (let key of Object.keys(parent)) {
      query[key] = parent[key];
    }
    update = {};
    for (let key of Object.keys(product)) {
      update['variants.$.' + key] = product[key];
    }
    ReactionImport._buffers['Products'].find(query).update({ $set: update });
  } else {
    ReactionCore.Schemas.Product.clean(product);
    if (ReactionImport._contexts.Product) {
      ReactionImport._contexts.Product.validate(product, {});
    } else {
      ReactionImport._contexts.Product = ReactionCore.Schemas.Product.newContext();
    }
    // Upsert products.
    ReactionImport._buffers['Products'].find(key).upsert().update({
      $set: product,
      $setOnInsert: { createdAt: new Date() }
    });
  }
  if (ReactionImport._count++ >= ReactionImport._limit) {
    ReactionImport.flush();
  }
}

/**
 * @summary Store a tag in the import buffer.
 * @param {Object} key A key to look up the tag
 * @param {Object} tag The tag data to be updated
 */
ReactionImport.tag = function (key, tag) {
  ReactionCore.Schemas.Tag.clean(tag);
  if (ReactionImport._contexts.Tag) {
    ReactionImport._contexts.Tag.validate(tag, {});
  } else {
    ReactionImport._contexts.Tag = ReactionCore.Schemas.Tag.newContext();
  }
  // Upsert tags.
  ReactionCore.Collections.Tags.before.update(Meteor.userId(), tag);
  ReactionImport._buffers['Tags'].find(key).upsert().update({
    $set: tag,
    $setOnInsert: { createdAt: new Date() }
  });
  if (ReactionImport._count++ >= ReactionImport._limit) {
    ReactionImport.flush();
  }
}

ReactionImport.image = function (key, image, links) {}

ReactionImport.relation = function (key, relation) {}
