import { Products, Revisions } from "/lib/collections";
import { Logger } from "/server/api";

// Products.before.insert((userId, order) => {
//   const analyticsEvent = {
//     eventType: "buy",
//     value: order._id,
//     label: "bought products"
//   };
//   AnalyticsEvents.insert(analyticsEvent);
// });
//


// Products.before.findOne((userId, selector, options) => {
//   let productRevision = Revisions.findOne({
//     documentId: product._id
//   });
//
//   if (productRevision)
// })

// Products.after.find((userId, selector, options, cursor) => {
//   // console.log("poop!", cursor);
//
//   cursor.forEach((product) => {
//     console.log("loaded product", product._id);
//     product.__revisions = ["POOOOOP"]
//   })
//   // console.log("after HOOK!!!!!!!", product);
//   // let productRevision = Revisions.findOne({
//   //   documentId: product._id
//   // });
//   //
//   // product.__revisions = [
//   //   productRevision
//   // ];
//   //
//   return cursor
// });
//
// Products.after.findOne((userId, selector, options, product) => {
//   console.log("after HOOK!!!!!!!", product);
//   let productRevision = Revisions.findOne({
//     documentId: product._id
//   });
//
//   product.__revisions = [
//     productRevision
//   ];
// });
//

function findRelevantDraft() {

}

Products.before.insert((userId, product) => {
  console.log("before insert", product);

  let productRevision = Revisions.findOne({
    documentId: product._id
  });
  console.log(productRevision);
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

    // return true;
  }

  // return false;
});


Products.before.update((userId, product, fieldNames, modifier, options) => {
  let productRevision = Revisions.findOne({
    documentId: product._id
  });

  if (!productRevision) {
    Logger.info(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
    Revisions.findOne({
      documentId: product._id
    });
  }


  // Revisions.update({
  //   documentId: product._id
  // }, modifier);


  let revisionModifier = {
    $set: {}
  };

  // console.log(modifier.$set);
  for (let key in modifier.$set) {
    if (Object.hasOwnProperty.call(modifier.$set, key)) {
      switch (key) {
      case "isVisible":
        const isVisible = !productRevision.documentData.isVisible;
        revisionModifier.$set[`documentData.${key}`] = isVisible;
        break;
      default:
        revisionModifier.$set[`documentData.${key}`] = modifier.$set[key];
      }
    }
  }
  // console.log("------------------------------------------");
  // console.log("-- New Modifier");
  // console.log(revisionModifier);
  // console.log("------------------------------------------");
  //
  // console.log("------------------------------------------");
  // console.log(userId, product, fieldNames, modifier, options);
  // console.log("------------------------------------------");
  //

  if (options.publish === true) {
    // Maybe mark the revision as published

    Logger.info(`Publishing revison for product ${product._id}.`);

    return true;
  }

  Revisions.update({
    documentId: product._id
  }, revisionModifier);

  Logger.info(`Revison updated for product ${product._id}.`);

  // prevent the underlying document from being modified as it is in draft mode
  return false;
});
