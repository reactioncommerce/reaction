/**
 * Tag client tests.
 *
 */

describe("Tags", function () {
  beforeAll(function (done) {
    Router.go("/product/tag/products");
    Tracker.afterFlush(done);
  });

  beforeEach(waitForRouter);

  it("loads navigation header", function () {
    expect($(".navbar-tags")).toBeInDOM();

    expect($("*[data-event-value='Products']")).toContainText("Products");
  });

  it("should go to tag route when clicked", function (done) {
    let tag = $("*[data-event-category='tag']").attr("href");
    let tagLink = $("*[href='" + tag + "']");
    expect($(".navbar-tags")).toBeInDOM();
    expect($("*[data-event-value='Products']")).toContainText("Products");

    spyOnEvent(tagLink, "click");
    $(tagLink).trigger("click");
    expect("click").toHaveBeenTriggeredOn(tagLink);

    let route = Router.current().url;
    expect(route).toEqual(tag);
    done();
  });
});
