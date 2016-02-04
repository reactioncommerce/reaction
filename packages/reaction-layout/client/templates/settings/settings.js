
Template.reactionLayoutSettings.events({
  "input input[name=navcolor]"(event) {
    console.log(event.target.value);

    const styles = `
    .rui.navbar {
      background-color: ${event.target.value};
    }
    `;

    $("#reactionLayoutStyles").text(styles);
  }
});
