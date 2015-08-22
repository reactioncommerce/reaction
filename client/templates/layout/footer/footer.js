/*
 * This is an example of a customized template.
 * This footer replaces the "layoutFooter" template defined in the reactioncommerce:core package.
 * https://github.com/reactioncommerce/reaction-core/blob/master/client/templates/layout/footer/footer.html
 */
 
Template.layoutFooter.helpers({
  customSocialSettings: function() {
    return {
      placement: 'footer',
      faClass: 'square',
      faSize: 'fa-3x',
      appsOrder: ['facebook', 'twitter', 'pinterest', 'googleplus']
    };
  }
});

Template.footer.replaces("layoutFooter");
