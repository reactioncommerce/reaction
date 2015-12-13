ReactionCore.Schemas.Templates = new SimpleSchema({
  template: {
    type: String
  },
  language: {
    type: String,
    optional: true,
    defaultValue: "en"
  },
  source: {
    type: String,
    optional: true
  }
});
