import Home from '../Home.jsx';
import NotFound from '../NotFound.jsx';

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '*',
    component: NotFound
  }
];

export default routes;
