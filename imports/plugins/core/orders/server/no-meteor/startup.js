
// import rawCollections from "/imports/collections/rawCollections";
// import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
// import appEvents from "/imports/node-app/core/util/appEvents";
// import getTopLevelVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/getTopLevelVariant.js";
// import getVariantInventoryAvailableToSellQuantity from "/imports/plugins/core/catalog/server/no-meteor/utils/getVariantInventoryAvailableToSellQuantity.js";

// /**

// /**
//  * @summary Called on startup
//  * @param {Object} context Startup context
//  * @param {Object} context.collections Map of MongoDB collections
//  * @returns {undefined}
//  */
// export default function startup(context) {
//   appEvents.on("afterOrderCreate", async (order) => {
//     const { collections } = context;
//     const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

//     orderItems.forEach(async (item) => {
//       // Update supplied items inventory
//       await collections.Products.updateOne(
//         {
//           _id: item.variantId
//         },
//         {
//           $inc: {
//             inventoryAvailableToSell: -item.quantity
//           }
//         },
//         {
//           publish: true,
//           selector: {
//             type: "variant"
//           }
//         }
//       );

//       // Check to see if this is the top level variant, or an option
//       const topLevelVaraint = await getTopLevelVariant(item.variantId, collections);

//       // If it was an option, update the quantity on it's parent too
//       if (topLevelVaraint._id !== item.varaintId) {
//         const variantInventoryAvailableToSellQuantity = await getVariantInventoryAvailableToSellQuantity(topLevelVaraint, context.collections);

//         await collections.Products.updateOne(
//           {
//             _id: topLevelVaraint._id
//           },
//           {
//             $set: {
//               inventoryAvailableToSell: variantInventoryAvailableToSellQuantity
//             }
//           },
//           {
//             publish: true,
//             selector: {
//               type: "variant"
//             }
//           }
//         );
//       }

//       // Publish inventory updates to the Catalog
//       Promise.await(updateCatalogProductInventoryStatus(item.productId, rawCollections));
//     });
//   });
// }
