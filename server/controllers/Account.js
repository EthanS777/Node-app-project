const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const changePassPage = (req, res) => res.render('changePass');

const logout = (req, res) => {
  // session.destroy(): removes user's session, no longer logged in
  req.session.destroy();
  res.redirect('/');
};

// change pass: implement change password system
const changePass = async (req, res) => {
  const { username, oldPass, newPass } = req.body;

  try {
    // find user's account by username
    const user = await Account.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // authenticate, check if old password is correct
    const isAuth = await new Promise((resolve) => {
      Account.authenticate(username, oldPass, (err, doc) => {
        if (err || !doc) {
          return resolve(false);
        }
        return resolve(true);
      });
    });

    if (!isAuth) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // if correct, hash new password
    const hashedPassword = await Account.generateHash(newPass);

    // save/update new password
    user.password = hashedPassword;
    await user.save();

    // log out after submitting form, tell user to log in again with NEW creds
    req.session.destroy();
    return res.json({ redirect: '/' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/home' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();

    req.session.account = Account.toAPI(newAccount);

    return res.json({ redirect: '/home' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const failPage = (req, res) => res.status(404).json({ error: 'Page does not exist!' });

module.exports = {
  loginPage,
  login,
  logout,
  failPage,
  signup,
  changePass,
  changePassPage,
};
