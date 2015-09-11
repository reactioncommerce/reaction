/**
 * Tag client tests.
 *
 */

describe('Tags', function () {
  beforeAll(function (done) {
    Router.go('/product/tag/products');
    Tracker.afterFlush(done);
  });

  beforeEach(waitForRouter);

  it('loads navigation header', function () {
    expect($('.navbar-tags')).toBeInDOM();

    expect( $('*[data-event-value="Products"]')).toContainText("Products");
  });

  it('should go to tag route when clicked', function (done) {

    var tagLink = $('*[data-event-value="Products"]');

    expect($('.navbar-tags')).toBeInDOM();
    expect($('*[data-event-value="Products"]')).toContainText("Products");

    $('.navbar-tags a').trigger("click");

    /*expect('click').toHaveBeenTriggeredOn(tagLink);*/

    var route = Router.current().url;
    expect(route).toContain("product/tag/products");
    done();
  });

});
