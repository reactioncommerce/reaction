import { Router } from "/client/api";

/**
 * Tag client tests.
 *
 */

describe("Tags", function () {
  beforeAll(function (done) {
    Router.go("tag", {
      slug: "products"
    });
    Tracker.afterFlush(done);
  });

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

    let route = Router.current().path;
    expect(route).toEqual(tag);
    done();
  });
});
