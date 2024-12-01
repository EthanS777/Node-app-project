const helper = require('./helper.js');
const React = require('react');
// const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

// JS function that fires when form is submitted
const handlePassChange = (e) => {
    e.preventDefault();
    helper.hideError();
  
    const username = e.target.querySelector("#username").value;
    const oldPass = e.target.querySelector("#oldPassword").value;
    const newPass = e.target.querySelector("#newPassword").value;
  
    if (!username || !oldPass || !newPass) {
      helper.handleInfo('All fields are required!');
      return false;
    }

    helper.sendPost(e.target.action, {username, oldPass, newPass})
  
    return false;
  
}

// React component returning the form
const PassChangeForm = () => {
  return (
    <form action="/changePass"
     method="POST" 
     id="change-pass-form"
     onSubmit={(e) => handlePassChange(e)}
     >
     
    <label htmlFor="username">Username:</label>
    <input type="text" id="username" name="username" placeholder="Username" />
  
    <label htmlFor="oldPassword">Old Password:</label>
    <input type="password" id="oldPassword" name="oldPassword" placeholder="Old password" />

    <label htmlFor="newPassword">New Password:</label>
    <input type="password" id="newPassword" name="newPassword" placeholder="New password" />
  
  <button type="submit">Change Password</button>
  </form>
  )
};

// React component returning the Form component
const App = () => {
  return ( 
    <div id="passChange">
      <PassChangeForm />
    </div>
  );
};

// Render onto the screen on first load
const init = () => {
  const root = createRoot(document.querySelector("#passContent"));
  root.render(<App />);
};

window.onload = init;
