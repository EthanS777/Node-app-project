/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/
const handleInfo = (message) => {
   document.querySelector("#userInfo").innerHTML = `<h3>${message}</h3>`;
   document.querySelector("#userInfo").style.display = "block";
  };
  
  /* Sends post requests to the server using fetch. Will look for various
     entries in the response JSON object, and will handle them appropriately.
  */
  const sendPost = async (url, data, handler) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    const result = await response.json();
  
    if(result.redirect) {
      window.location = result.redirect;
    }
  
    if(result.error) {
      handleInfo(result.error);
    }

    if (handler) {
        handler(result);
    }
  };

  const hideError = () => {
   document.querySelector("#userInfo").style.display = "none";
  };

  module.exports = {
    handleInfo,
    sendPost,
    hideError,
  };