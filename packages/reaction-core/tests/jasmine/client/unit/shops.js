
/*
* client unit tests
*
*/


describe('client layout', function() {
  describe('coreLayout template', function() {
    it('loads navigation header', function() {
      expect($('body > nav.reaction-navigation-header').text()).not.toBeNull();
    });
    it('loads product pricing', function() {
      expect($('div.currency-symbol').text()).not.toBeNull();
    });
  });
});
