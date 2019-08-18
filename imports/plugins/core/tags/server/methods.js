import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction } from "/lib/api";
import { Tags } from "/lib/collections";

Meteor.methods({
  "tags/getBySlug": async (term, excludedTagIds) => {
    check(term, String);
    check(excludedTagIds, Match.OneOf(undefined, Array));

    // Return a blank result set for non admins
    if (!Reaction.hasPermission(["admin", "owner", "createProduct", "product/admin", "product/update"], this.userId)) {
      return [];
    }

    const slug = await Reaction.getSlug(term);

    const selector = {
      slug: new RegExp(slug, "i")
    };

    if (Array.isArray(excludedTagIds)) {
      selector._id = {
        $nin: excludedTagIds
      };
    }

    const tags = Tags.find(selector, { limit: 4 }).map((tag) => ({
      label: tag.name,
      slug: tag.slug
    }));

    return tags;
  }
});
