if (Meteor.isClient) {
  layout = new Iron.Layout({ /* template: 'MyTemplate', data: myDataFunc */ });

  Meteor.startup(function () {
    // insert into the body
    layout.insert();
    layout.template('MyLayout');
    layout.render('MainPage');
    layout.data({title: 'Layout Title'});


    layout.beginRendering();

    // now override it with a region specific data context
    layout.render('MainPage', {
      data: {title: 'Page Title'}
    });

    Deps.flush();

    var renderedRegions = layout.endRendering();
    console.log(renderedRegions);

  });
}
