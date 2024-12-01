const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getTasks', mid.requiresLogin, controllers.Task.getTasks);
  app.post('/makeTask', mid.requiresLogin, controllers.Task.makeTask);

  // using ".delete" here
  app.delete('/getTasks/:id', mid.requiresLogin, controllers.Task.deleteTask);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/changePass', mid.requiresLogin, controllers.Account.changePassPage);
  app.post('/changePass', mid.requiresLogin, controllers.Account.changePass);

  app.get('/home', mid.requiresLogin, controllers.Task.homePage);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.get('/*', controllers.Account.failPage);
};

module.exports = router;
