import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import createJobCollection from "@reactioncommerce/job-queue";

const later = Meteor.isServer && require("later");

const classes = createJobCollection({ Mongo, Meteor, check, Match, later });

export const { Job, JobCollection } = classes;
