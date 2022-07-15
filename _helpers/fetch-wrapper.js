const fetch = require('node-fetch');

module.exports = {
    get,
    // post,
    // put,
    // delete: _delete
}

function handleResponse(response) {    

    return response.text().then(text => {
        
        try {
            const data = text && JSON.parse(text);                    

            if (!response.ok) {            
                // if ([401, 403].includes(response.status) && accountService.userValue) {
                //     // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                //     accountService.logout();
                // }

                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }

            return data;
        } catch(e) {
            console.log('fetch-wrapper.handleResponse: ', e);

            return Promise.reject('Fetch reponse is not in JSON format: ' + text);
        }        
    });
}

function get(url, options) {      
    return fetch(url, options).then(handleResponse);
}

// function post(url, body) {
//     const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...authHeader(url) },
//         credentials: 'include',
//         body: JSON.stringify(body)
//     };
//     return fetch(url, requestOptions).then(handleResponse);
// }

// function put(url, body) {
//     const requestOptions = {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json', ...authHeader(url) },
//         body: JSON.stringify(body)
//     };
//     return fetch(url, requestOptions).then(handleResponse);    
// }

// // prefixed with underscored because delete is a reserved word in javascript
// function _delete(url) {
//     const requestOptions = {
//         method: 'DELETE',
//         headers: authHeader(url)
//     };
//     return fetch(url, requestOptions).then(handleResponse);
// }

// helper functions

// function authHeader(url) {
//     // return auth header with jwt if user is logged in and request is to the api url
//     const user = accountService.userValue;
//     const isLoggedIn = user && user.jwtToken;
//     if (isLoggedIn && isApiUrl) {
//         return { Authorization: `Bearer ${user.jwtToken}` };
//     } else {
//         return {};
//     }
// }