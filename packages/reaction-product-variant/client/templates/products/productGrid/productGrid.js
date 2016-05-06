/**
 * productGrid helpers
 */

Template.productGrid.onCreated(function () {
  Session.set("productGrid/selectedProducts", []);
});

Template.productGrid.events({
  "click [data-event-action=loadMoreProducts]": (event) => {
    event.preventDefault();
    loadMoreProducts();
  },
  "change input[name=selectProduct]": (event) => {
    let selectedProducts = Session.get("productGrid/selectedProducts");

    if (event.target.checked) {
      selectedProducts.push(event.target.value);
    } else {
      selectedProducts = _.without(selectedProducts, event.target.value);
    }

    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    let productCursor = Template.currentData().products;

    if (productCursor) {
      const products = productCursor.fetch();

      let filteredProducts = _.filter(products, (product) => {
        return _.contains(selectedProducts, product._id);
      });

      ReactionCore.showActionView({
        label: i18next.t("productDetailEdit.productSettings"),
        template: "productSettings",
        type: "product",
        data: {
          products: filteredProducts
        }
      });
    }
  }
});

Template.productGrid.helpers({
  loadMoreProducts() {
    return Template.instance().state.equals("canLoadMoreProducts", true);
  },
  products() {
    return Template.currentData().products;
  }
});
