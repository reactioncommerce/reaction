Template.variant.events = {
//  'change input[name="variant"]': function (e, template) {
//    if (e.target.checked) {
//
//    }
//    return true;
//  },
  'click .remove-link': function (e, template) {
    if (confirm($(e.target).closest('a').data('confirm'))) {
      Products.update(Session.get('currentProductId'), {$pull: {variants: template.data}});
    }
    e.preventDefault();
    e.stopPropagation();
  },
  'click .edit-link': function (e, template) {
//    $('#variants-modal form').get(0).reset();
    Session.set('currentVariantIndex', $(e.target).closest('tr').prevAll().length);
    $('#variants-modal').modal();
    e.preventDefault();
    e.stopPropagation();
  }
};
