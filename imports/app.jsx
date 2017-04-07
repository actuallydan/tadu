import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, browserHistory } from 'react-router';
import ReactDOM from 'react-dom';

import routes from './router/routes.js';
import MainLayout from './MainLayout.jsx';

const rootRoute = {
  component: MainLayout,
  childRoutes: routes,
};

Meteor.startup(() => {
  ReactDOM.render(
    <MainLayout />,
    document.getElementById('app')
  );
});
