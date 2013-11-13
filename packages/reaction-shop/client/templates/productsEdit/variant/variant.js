Template.variant.events = {
  'click .remove-link': function (e, template) {
    if (confirm($(e.target).closest('a').data('confirm'))) {
      Products.update(Session.get('currentProductId'), {$pull: {variants: template.data}});
    }
    e.preventDefault()
  },
  'click .edit-link': function (e, template) {
    $('#variant-edit-modal form').get(0).reset();
    Session.set('currentVariantIndex', $(e.target).closest('tr').prevAll().length);
    $('#variant-edit-modal').modal();
    e.preventDefault()
  }
};
