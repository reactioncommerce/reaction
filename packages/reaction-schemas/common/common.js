//
// package global getSlug helper
// todo: we really need to namespace this to reaction
//
if (Meteor.isClient) {
  getSlug = function(slugString) {
    return window.Transliteration.slugify(slugString);
  }
} else {
  getSlug = function(slugString) {
    return Transliteration.slugify(slugString);
  }
}
