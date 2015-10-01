/**
* productMetaFieldForm events
*/

Template.productMetaFieldForm.events({
  'click .metafield-remove': function(event, template) {
    var productId;
    productId = selectedProductId();
    return Products.update(productId, {
      $pull: {
        metafields: this
      }
    });
  }
});


/**
* metaComponent helpers
*/

Template.metaComponent.events({
  'change input': function(event, template) {
    var productId, updateMeta;
    updateMeta = {
      key: $(event.currentTarget).parent().children('.metafield-key-input').val(),
      value: $(event.currentTarget).parent().children('.metafield-value-input').val()
    };
    if (this.key) {
      productId = selectedProductId();
      Meteor.call("products/updateMetaFields", productId, updateMeta, this);
      $(event.currentTarget).animate({
        backgroundColor: "#e2f2e2"
      }).animate({
        backgroundColor: "#fff"
      });
      return Tracker.flush();
    } else {
      if (updateMeta.value && !updateMeta.key) {
        $(event.currentTarget).parent().children('.metafield-key-input').val('').focus();
      }
      if (updateMeta.key && updateMeta.value) {
        Meteor.call("products/updateMetaFields", this._id, updateMeta);
        Tracker.flush();
        $(event.currentTarget).parent().children('.metafield-key-input').val('').focus();
        return $(event.currentTarget).parent().children('.metafield-value-input').val('');
      } else {

      }
    }
  }
});
