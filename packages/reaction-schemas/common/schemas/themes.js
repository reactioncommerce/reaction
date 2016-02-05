/**
 * @summary Themes Schema
 * Schema for themes used in reaction-layout
 */

ReactionCore.Schemas.Themes = new SimpleSchema({
  name: {
    type: String,
    index: true
  },
  styles: {
    type: String,
    optional: true
  }
});
