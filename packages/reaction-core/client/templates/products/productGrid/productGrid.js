/**
 * productGrid helpers
 */

/**
 * loadMoreProducts
 * @summary whenever #productScrollLimitLoader becomes visible, retrieve more results
 * this basically runs this:
 * Session.set('productScrollLimit', Session.get('productScrollLimit') + ITEMS_INCREMENT);
 * @return {undefined}
 */
function loadMoreProducts() {
  let threshold;
  let target = $("#productScrollLimitLoader");
  let scrollContainer = $("#reactionAppContainer");

  if (scrollContainer.length === 0) {
    scrollContainer = $(window);
  }

  if (target.length) {
    threshold = scrollContainer.scrollTop() + scrollContainer.height() - target.height();

    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("productScrollLimit", true);
        Session.set("productScrollLimit",
          Session.get("productScrollLimit") + ITEMS_INCREMENT || 10);
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }
}

Template.productGrid.onCreated(() => {
  Session.set("productGrid/selectedProducts", []);

  Template.instance().autorun(() => {
    let isActionViewOpen = ReactionCore.isActionViewOpen();
    let actionView = ReactionCore.getActionView();

    if (isActionViewOpen === false) {
      Session.set("productGrid/selectedProducts", []);
    }
  });
});

Template.productGrid.onRendered(() => {
  // run the above func every time the user scrolls
  $("#reactionAppContainer").on("scroll", loadMoreProducts);
  $(window).on("scroll", loadMoreProducts);
});

Template.productGrid.events({

  "click [data-event-action=loadMoreProducts]": (event) => {
    event.preventDefault();

    loadMoreProducts();
  },

  "change input[name=selectProduct]": (event, template) => {
    let selectedProducts = Session.get("productGrid/selectedProducts");

    if (event.target.checked) {
      selectedProducts.push(event.target.value);
    } else {
      selectedProducts = _.without(selectedProducts, event.target.value);
    }

    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    let products = Template.instance().products;
    let filteredProducts = _.filter(products, (product) => {
      return _.contains(selectedProducts, product._id);
    });

    ReactionCore.showActionView({
      label: "Edit Product",
      template: "productSettings",
      type: "product",
      data: {
        products: filteredProducts
      }
    });
  }
});

Template.productGrid.helpers({
  productScrollLimit: function () {
    // if count less rows than we asked for, we've got all the rows in the collection.
    return !(ReactionCore.Collections.Products.find().count() < Session.get(
      "productScrollLimit"));
  },
  products: function () {
    /*
     * take natural sort, sorting by updatedAt
     * then resort using positions.position for this tag
     * retaining natural sort of untouched items
     */
    let hashtags;
    let newRelatedTags;
    let position;
    let relatedTags;

    // function to compare and sort position
    function compare(a, b) {
      if (a.position.position === b.position.position) {
        let x = a.position.updatedAt;
        let y = b.position.updatedAt;

        if (x > y) {
          return -1;
        } else if (x < y) {
          return 1;
        }

        return 0;
      }
      return a.position.position - b.position.position;
    }

    let tag = this.tag || this._id || "";
    let selector = {};

    if (tag) {
      hashtags = [];
      relatedTags = [tag];
      while (relatedTags.length) {
        newRelatedTags = [];
        for (let relatedTag of relatedTags) {
          if (hashtags.indexOf(relatedTag._id) === -1) {
            hashtags.push(relatedTag._id);
          }
        }
        relatedTags = newRelatedTags;
      }
      selector.hashtags = {
        $in: hashtags
      };
    }

    let gridProducts = Products.find(selector).fetch();

    for (let index in gridProducts) {
      if ({}.hasOwnProperty.call(gridProducts, index)) {
        let gridProduct = gridProducts[index];
        if (gridProduct.positions) {
          let _results = [];
          for (position of gridProduct.positions) {
            if (position.tag === ReactionCore.getCurrentTag()) {
              _results.push(position);
            }
            gridProducts[index].position = _results[0];
          }
        }
        if (!gridProduct.position) {
          gridProducts[index].position = {
            position: 0,
            weight: 0,
            pinned: false,
            updatedAt: gridProduct.updatedAt
          };
        }
      }
    }

    const products = gridProducts.sort(compare);
    Template.instance().products = products;
    return products;
  }
});
