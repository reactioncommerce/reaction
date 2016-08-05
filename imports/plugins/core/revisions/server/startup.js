import { Products, Revisions } from "/lib/collections";
import { Logger } from "/server/api";


Products.before.insert((userId, product) => {
  let productRevision = Revisions.findOne({
    documentId: product._id
  });

  if (!productRevision) {
    Logger.info(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
  }

  if (options.publish === true) {
    // Maybe mark the revision as published
    Logger.info(`Publishing revison for product ${product._id}.`);
  }
});


Products.before.update(function (userId, product, fieldNames, modifier, options) {
  let productRevision = Revisions.findOne({
    documentId: product._id
  });

  const originalSelector = this.args[0];

  if (!productRevision) {
    Logger.info(`No revision found for product ${product._id}. Creating new revision`);

    // Create a new revision
    Revisions.insert({
      documentId: product._id,
      documentData: product
    });

    // Fetch newly created revision
    productRevision = Revisions.findOne({
      documentId: product._id
    });
  }

  // Create a new selector for the revision
  //
  // This is especially important since we may need to update some fields
  // like metadata, and the selector is very important to that.
  let revisionSelector = {
    documentId: product._id
  };

  // Create a new modifier for the revision
  let revisionModifier = {
    $set: {
      "workflow.status": "revision/update"
    }
  };

  // console.log(modifier.$set);
  for (let key in modifier.$set) {
    if (Object.hasOwnProperty.call(modifier.$set, key)) {
      switch (key) {
      case "isVisible":
        const isVisible = !productRevision.documentData.isVisible;
        revisionModifier.$set[`documentData.${key}`] = isVisible;
        break;
      case "metafields.$":
        revisionSelector["documentData.metafields"] = originalSelector.metafields;
        revisionModifier.$set[`documentData.${key}`] = modifier.$set[key];
        break;
      default:
        revisionModifier.$set[`documentData.${key}`] = modifier.$set[key];
      }
    }
  }

  if (options.publish === true || (product.workflow && product.workflow.status === "product/publish")) {
    // Maybe mark the revision as published

    Logger.info(`Publishing revison for product ${product._id}.`);

    return true;
  }

  Revisions.update(revisionSelector, revisionModifier);

  Logger.info(`Revison updated for product ${product._id}.`);

  // prevent the underlying document from being modified as it is in draft mode
  return false;
});

Products.before.remove(function (userId, product) {
  let productRevision = Revisions.findOne({
    documentId: product._id
  });

  if (!productRevision) {
    Logger.info(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
    productRevision =  Revisions.findOne({
      documentId: product._id
    });
  }

  // Set the revision as deleted "isDeleted: true"
  Revisions.update({
    documentId: product._id
  }, {
    $set: {
      "documentData.isDeleted": true,
      "workflow.status": "revision/remove"
    }
  });

  Logger.info(`Revison updated for product ${product._id}.`);
  Logger.info(`Product ${product._id} is now marked as deleted.`);

  // If the original product is deleted, and the user is trying to delete it again,
  // then actually remove it completly.
  //
  // This acts like a trash. Where the product is sent to trash before it can actually
  // be deleted perminately.
  if (product.isDeleted === true) {
    Logger.info(`Allowing write to product ${product._id} for Collection.remove().`);

    return true;
  }

  Logger.info(`Preventing write to product ${product._id} for Collection.remove().`);

  return false;
});
