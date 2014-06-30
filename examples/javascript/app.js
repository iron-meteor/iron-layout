if (Meteor.isClient) {
  layout = new Iron.Layout({ /* template: 'MyTemplate', data: myDataFunc */ });

  Meteor.startup(function () {
    // insert into the body
    layout.insert();
    layout.template('MyLayout');
    layout.render('MainPage');
  });
}
