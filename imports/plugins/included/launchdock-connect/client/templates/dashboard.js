import moment from "moment";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveStripe } from "meteor/jeremy:stripe";
import { Packages } from "/lib/collections";
import Launchdock from "../../lib/launchdock";

Template.launchdockDashboard.onCreated(function () {
  // create and return connection
  const launchdock = Launchdock.connect();

  // remote users collection (only contains current user)
  this.LaunchdockUsers = new Mongo.Collection("users", {
    connection: launchdock
  });

  // remote stacks collection (only contains current stack)
  this.LaunchdockStacks = new Mongo.Collection("stacks", {
    connection: launchdock
  });

  // remote settings collection (only contains Stripe public key)
  this.LaunchdockSettings = new Mongo.Collection("settings", {
    connection: launchdock
  });

  const user = Meteor.user();

  // subscribe to user/stack details
  this.ldStackSub = launchdock.subscribe("reaction-account-info", user.services.launchdock.stackId);

  // Stripe public key for Launchdock
  launchdock.subscribe("launchdock-stripe-public-key");

  // setup Stripe client libs
  this.autorun(() => {
    this.stripeKey = new ReactiveVar();
    const s = this.LaunchdockSettings.findOne();

    if (s) {
      const key = s.stripeLivePublishableKey || s.stripeTestPublishableKey;

      // store key in ReactiveVar on template instance
      this.stripeKey.set(key);

      // load client side Stripe libs
      ReactiveStripe.load(key);
    }
  });
});


Template.launchdockDashboard.helpers({

  packageData() {
    return Packages.findOne({
      name: "reaction-connect"
    });
  },

  launchdockDataReady() {
    return Template.instance().ldStackSub.ready();
  },

  launchdockStack() {
    return Template.instance().LaunchdockStacks.findOne();
  },

  trial() {
    const stack = Template.instance().LaunchdockStacks.findOne();
    // calculate the trial end date and days remaining
    let ends;
    let daysRemaining;
    let daySuffix;

    if (stack) {
      const startDate = stack.createdAt;
      ends = new Date();
      ends.setDate(startDate.getDate() + 30);
      const now = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;
      const timeLeft = ends.getTime() - now.getTime();
      const daysLeft = timeLeft / msPerDay;
      daysRemaining = Math.floor(daysLeft);
      daySuffix = daysRemaining === 1 ? " day" : " days";
    }
    return {
      ends: moment(ends).format("MMMM Do YYYY"),
      daysRemaining: daysRemaining + daySuffix
    };
  },

  shopCreatedAt() {
    const stack = Template.instance().LaunchdockStacks.findOne();
    return stack ? moment(stack.createdAt).format("MMMM Do YYYY, h:mma") : "";
  },

  isSubscribed() {
    const user = Template.instance().LaunchdockUsers.findOne();
    return !!(user && user.subscription && user.subscription.status === "active");
  },

  plan() {
    const user = Template.instance().LaunchdockUsers.findOne();
    return user && user.subscription ? user.subscription.plan.name : null;
  },

  nextPayment() {
    const user = Template.instance().LaunchdockUsers.findOne();
    if (user && user.subscription) {
      const nextPayment = user.subscription.next_payment;
      return moment(nextPayment).format("LL");
    }
    return null;
  },

  yearlyPaymentDate() {
    const today = new Date();
    const nextDue = new Date();
    nextDue.setDate(today.getDate() + 365);

    return moment(nextDue).format("LL");
  }
});


Template.launchdockDashboard.events({
  // open settings panel
  "click [data-event-action=showLaunchdockSettings]"() {
    Reaction.showActionView({
      label: "SSL Settings",
      template: "connectSettings",
      data: this
    });
  },

  // change UI based on which subscription option is chosen
  "change input[name='plan-choice']"(e, t) {
    const plan = t.$("input[name='plan-choice']:checked").val();

    let dueToday;
    let term;

    if (plan === "Yearly") {
      dueToday = "$540 for 12 months";
      term = dueToday;
      daysFromNow = 365;
    } else {
      dueToday = "$50 for first month";
      term = "$50 per month";
      daysFromNow = 30;
    }

    const today = new Date();
    const nextDue = new Date();
    nextDue.setDate(today.getDate() + daysFromNow);

    t.$(".price").text(dueToday);
    t.$(".term").text(term);
    t.$(".next-due").text(moment(nextDue).format("LL"));
  },

  // trigger subscription checkout
  "click .checkout"(e, t) {
    e.preventDefault();

    const stripeKey = Template.instance().stripeKey.get();

    if (!stripeKey) {
      Alerts.add("Unable to process a payment. Please contact support.", "danger");
    }

    const plan = t.$("input[name='plan-choice']:checked").val();

    let price;

    if (plan === "Yearly") {
      price = 54000;
    } else {
      price = 5000;
    }

    const user = Meteor.user();

    const charge = StripeCheckout.configure({
      key: stripeKey,
      image: "https://reactioncommerce.com/images/reaction-logo.png",
      locale: "auto",
      email: user.emails[0].address,
      panelLabel: `Subscribe (${plan.toLowerCase()})`,
      token: (token) => {
        const options = {
          cardToken: token.id,
          plan: plan.toLowerCase(),
          stackId: user.services.launchdock.stackId
        };

        const launchdock = Launchdock.connect();

        launchdock.call("stripe/createCustomerAndSubscribe", options, (err) => {
          if (err) {
            Alerts.add("Unable to process a payment. Please contact support.", "danger");
          } else {
            Alerts.add("Thank you for your payment!", "success", {
              autoHide: true
            });
          }
        });
      }
    });

    charge.open({
      name: "Reaction Commerce",
      description: `${plan} Subscription`,
      amount: price
    });
  }
});
