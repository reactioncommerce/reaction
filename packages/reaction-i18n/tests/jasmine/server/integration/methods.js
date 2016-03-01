describe("i18n methods", function () {
  describe("i18n/flushTranslations", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Translations, "remove");
      spyOn(ReactionImport, "translation");
      expect(function () {
        return Meteor.call("i18n/flushTranslations");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Translations.remove).not.toHaveBeenCalled();
      expect(ReactionImport.translation).not.toHaveBeenCalled();
      return done();
    });
    it("should remove and load translations back by admin", function (done) {
      spyOn(Meteor, "userId").and.returnValue("0123456789");
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore.Collections.Translations, "remove");
      Factory.create("shop");
      // spyOn(ReactionImport, "process");
      Meteor.call("i18n/flushTranslations");
      expect(ReactionCore.Collections.Translations.remove).toHaveBeenCalled();
      // expect(ReactionImport.process).toHaveBeenCalled();
      return done();
    });
  });
});
