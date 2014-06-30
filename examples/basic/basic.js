//XXX simply by making it a helper creates a reactive dependency! That's why
//when you us UI.dynamic it doesn't re-render if getData changes, but if you use
//a helper it does re-render. You want to find a template without creating a new
//dependency.
if (Meteor.isClient) {
  Meteor.startup(function () {
    layout = new Iron.DynamicTemplate;  
    layout.insert({el: '#mySel'});
  });
}
