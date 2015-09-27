/**
 * Reaction App Router
 * Define general app routing.
 * ReactionCore common/routing.js contains the core routes.
 */

let staticPages = ["about", "team", "faqs", "terms", "privacy" ];

/**
 * app router mapping
 */
Router.map(function route() {
  let page;
  let _i;
  let _len;
  for (_i = 0, _len = staticPages.length; _i < _len; _i++) {
    page = staticPages[_i];
    this.route(page, {
      controller: ShopController,
      name: page
    });
  }
  return this.route("notFound", {
    path: "/(.*)"
  });
});
