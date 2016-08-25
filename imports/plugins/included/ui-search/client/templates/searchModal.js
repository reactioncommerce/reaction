import { IconButton } from "/imports/plugins/core/ui/client/components";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Products } from "/lib/collections"
// import { Packages } from "/lib/collections";
// import { SearchPackageConfig } from "../../lib/collections/schemas";

// Meteor.publish("searchStuff", function () {
//
//
//   Products.find().observe({
//     added: (id, fields) => {
//       this.added("SearchQuery", id, fields)
//     },
//     changed: (id, fields) => {
//       this.changed("SearchQuery", id, fields)
//     },
//     removed: (id) => {
//       this.removed("SearchQuery", id)
//     }
//   });
//
//   return this.ready();
// });

Template.searchModal.onCreated(function () {
  this.products = ReactiveVar();
  this.state = new ReactiveDict();
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    searchResults: []
  });

  this.autorun(() => {
    const searchQuery = this.state.get("searchQuery");
    const sub = this.subscribe("SearchResults", "products", searchQuery); // collection, searchTerm, facets

    console.log("query", searchQuery);

    if (sub.ready()) {
      const results = Products.find().fetch();
    //   const results = Products.find({
    //   shopId: Reaction.getShopId(),
    //   title: {
    //     $regex: ".*" + searchQuery + ".*",
    //     $options: "i"
    //   }
    // }, {
    //   title: 1,
    //   hashtags: 1
    // }).fetch();
      this.state.set("searchResults", results);
      
      console.log("results", results);
    }
  });
});


Template.searchModal.helpers({
  IconButtonComponent() {
    const instance = Template.instance();
    const view = instance.view;

    return {
      component: IconButton,
      icon: "fa fa-times",
      onClick() {
        $(".js-search-modal").fadeOut(400, () => {
          $("body").css("overflow-y", "inherit");
          Blaze.remove(view);
        });
      }
    };
  }


  // send data to template.....
});


Template.searchModal.events({
  // on type, recload Reaction.SaerchResults
  "keyup input": (event, templateInstance) => {
    event.preventDefault();

    const searchQuery = templateInstance.find('#search-input').value;

    templateInstance.state.set("searchQuery", searchQuery)

  }
});

AutoForm.hooks({
  // "search-update-form": {
  //   /* eslint-disable no-unused-vars*/
  //   onSuccess(operation, result, template) {
  //     Alerts.removeSeen();
  //     return Alerts.add("Search settings saved.", "success");
  //   },
  //   onError(operation, error, template) {
  //     Alerts.removeSeen();
  //     return Alerts.add("Search settings update failed. " + error, "danger");
  //   }
  //   /* eslint-enable no-unused-vars*/
  // }
});
