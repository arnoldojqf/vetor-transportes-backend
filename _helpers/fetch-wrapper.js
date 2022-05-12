const fetch = require('node-fetch');

module.exports = {
    get,
    // post,
    // put,
    // delete: _delete
}

function get(url) {
    const opts = {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7,pt-BR;q=0.6,ru;q=0.5',
            'cache-control': 'max-age=0',
            'cookie': '_csrf=WJIBJqLtNsW6uBjL8ihkjz7i; ftid=TqDl5dAdJLbApqkdfqs0v6AzLaLSEle5-1651682235500; user_language=pt-BR; LOGISTICS_SC=BRPSP1; _ml_ga=GA1.3.1283391676.1651682348; _ml_ci=1283391676.1651682348; _hjSessionUser_1512977=eyJpZCI6ImYzZGFjNDJiLTNhYTgtNTZmOS04ZmZlLTEwN2M0NjlmNzc4MCIsImNyZWF0ZWQiOjE2NTE2ODIzNDk0MTgsImV4aXN0aW5nIjpmYWxzZX0=; _fbp=fb.2.1651682494529.1869480675; _d2id=46ad2f0a-231c-4f8d-8437-4a05a46d2e91; cp=30626600; _gcl_au=1.1.2046071864.1651682516; _uetvid=1c021570cbc911ec83945186896dafbc; __gads=ID=1a04081f837a2993:T=1651682516:S=ALNI_MZsyaV8FOuhkJIm93IzW3XjRj69AA; _ga_NDJFKMJ2PD=GS1.1.1651682515.1.0.1651682522.0; _ga=GA1.3.1367218362.1651682494; _gid=GA1.3.976110084.1652360426; _ml_ga_gid=GA1.3.1998319620.1652360435; _hjSessionUser_783944=eyJpZCI6ImVjZGJhYzRlLTFmMGQtNWE0ZS1iMzkwLTdiOTNjOWY4ZDc1YiIsImNyZWF0ZWQiOjE2NTE2ODI1MDQyMTcsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_720738=eyJpZCI6IjdkZmYyMWM4LTY4NTktNWQ5Yi1iN2M2LWQzY2YzZjFkNzkzOSIsImNyZWF0ZWQiOjE2NTIzNjA0NDMwMTQsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_580848=eyJpZCI6ImMxMDk4YjJjLTExMWEtNTk3ZS1iYTdhLWQ3YzhhMjFmNDY2NCIsImNyZWF0ZWQiOjE2NTIzNjA0ODAxNTUsImV4aXN0aW5nIjp0cnVlfQ==; cookiesPreferencesNotLogged=%7B%22categories%22%3A%7B%22advertising%22%3Atrue%7D%7D; _hjSessionUser_492923=eyJpZCI6IjY1NGFjYzNiLWFkNWQtNTY1MC04OTJlLWM5ZDMyMGYyNGQ3YSIsImNyZWF0ZWQiOjE2NTIzNjA5MDQ1MzIsImV4aXN0aW5nIjpmYWxzZX0=; _hjSessionUser_641080=eyJpZCI6Ijk2YTA4NTc4LTRiZjMtNWUxNS04YjY0LTY2NDI2YTNjMTljNCIsImNyZWF0ZWQiOjE2NTIzNjExNzc1OTYsImV4aXN0aW5nIjpmYWxzZX0=; orguserid=0ttH4dHZhd9T; ssid=ghy-051209-SClrWLyq5DKb9vSMNqu0kkd8caysf2-__-536772538-__-1746969295909--RRR_0-RRR_0; orgnickp=SC.BR.ICARVALHO75; orguseridp=669327054; nsa_rotok=eyJhbGciOiJIUzI1NiIsImtpZCI6InYyIiwidHlwIjoiSldUIn0.eyJpZGVudGlmaWVyIjoiYjU4NTQyYTktNjY4Ny00YWM4LWIxYTctYjAyNDRmYzdlOTkzIiwicm90YXRpb25faWQiOiIxOGY0NDQzOS0zY2YwLTQ2ZjQtYTY0My01OThkNDFhYjg3ZDMiLCJwbGF0Zm9ybSI6Ik1MIiwicm90YXRpb25fZGF0ZSI6MTY1MjM2MTg5NiwiZXhwaXJlIjoxNjUyNDQ3Njk2LCJleHAiOjE2NTQ5NTMyOTYsImp0aSI6Ijc2MjdjNDNjLWJlNzItNDgxZC1iNTVkLTk5NzNlNjlkZjQ3ZSIsImlhdCI6MTY1MjM2MTI5Niwic3ViIjoiMWE0ODg4YTBiY2I2YWY5ZGFlZDc5ODhjZGYzMDYzNDdmMjc5OWUxNDg3NTdjODgzOWZlM2U2Y2VkYmViM2RiZiJ9.LzZPqDkcKK9Hy7ol5yudeXjqVl9qShHll2Rg8c2WAC4',
            'device-memory': '8',
            'downlink': '10',
            'dpr': '1',
            'ect': '4g',
            'if-none-match': 'W/"1e8a2-OwwLDF6mulfoN3nZIByIlvQGz44"',
            'rtt': '50',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
            'viewport-width': '1920'
        }
    };
    //const result = await fetch(`/some/url`, opts).then(handleResponse);
    return fetch(url, opts).then(handleResponse);


    // const requestOptions = {
    //     hostname: hostname,
    //     port: 443,
    //     path: path,
    //     method: 'GET',
    //     headers: 
    //     {            
    //         'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    //         'accept-encoding': 'gzip, deflate, br',
    //         'accept-language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7,pt-BR;q=0.6,ru;q=0.5',
    //         'cache-control': 'max-age=0',
    //         'cookie': '_csrf=WJIBJqLtNsW6uBjL8ihkjz7i; ftid=TqDl5dAdJLbApqkdfqs0v6AzLaLSEle5-1651682235500; user_language=pt-BR; LOGISTICS_SC=BRPSP1; _ml_ga=GA1.3.1283391676.1651682348; _ml_ci=1283391676.1651682348; _hjSessionUser_1512977=eyJpZCI6ImYzZGFjNDJiLTNhYTgtNTZmOS04ZmZlLTEwN2M0NjlmNzc4MCIsImNyZWF0ZWQiOjE2NTE2ODIzNDk0MTgsImV4aXN0aW5nIjpmYWxzZX0=; _fbp=fb.2.1651682494529.1869480675; _d2id=46ad2f0a-231c-4f8d-8437-4a05a46d2e91; cp=30626600; _gcl_au=1.1.2046071864.1651682516; _uetvid=1c021570cbc911ec83945186896dafbc; __gads=ID=1a04081f837a2993:T=1651682516:S=ALNI_MZsyaV8FOuhkJIm93IzW3XjRj69AA; _ga_NDJFKMJ2PD=GS1.1.1651682515.1.0.1651682522.0; _ga=GA1.3.1367218362.1651682494; _gid=GA1.3.976110084.1652360426; _ml_ga_gid=GA1.3.1998319620.1652360435; _hjSessionUser_783944=eyJpZCI6ImVjZGJhYzRlLTFmMGQtNWE0ZS1iMzkwLTdiOTNjOWY4ZDc1YiIsImNyZWF0ZWQiOjE2NTE2ODI1MDQyMTcsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_720738=eyJpZCI6IjdkZmYyMWM4LTY4NTktNWQ5Yi1iN2M2LWQzY2YzZjFkNzkzOSIsImNyZWF0ZWQiOjE2NTIzNjA0NDMwMTQsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_580848=eyJpZCI6ImMxMDk4YjJjLTExMWEtNTk3ZS1iYTdhLWQ3YzhhMjFmNDY2NCIsImNyZWF0ZWQiOjE2NTIzNjA0ODAxNTUsImV4aXN0aW5nIjp0cnVlfQ==; cookiesPreferencesNotLogged=%7B%22categories%22%3A%7B%22advertising%22%3Atrue%7D%7D; _hjSessionUser_492923=eyJpZCI6IjY1NGFjYzNiLWFkNWQtNTY1MC04OTJlLWM5ZDMyMGYyNGQ3YSIsImNyZWF0ZWQiOjE2NTIzNjA5MDQ1MzIsImV4aXN0aW5nIjpmYWxzZX0=; _hjSessionUser_641080=eyJpZCI6Ijk2YTA4NTc4LTRiZjMtNWUxNS04YjY0LTY2NDI2YTNjMTljNCIsImNyZWF0ZWQiOjE2NTIzNjExNzc1OTYsImV4aXN0aW5nIjpmYWxzZX0=; orguserid=0ttH4dHZhd9T; ssid=ghy-051209-SClrWLyq5DKb9vSMNqu0kkd8caysf2-__-536772538-__-1746969295909--RRR_0-RRR_0; orgnickp=SC.BR.ICARVALHO75; orguseridp=669327054; nsa_rotok=eyJhbGciOiJIUzI1NiIsImtpZCI6InYyIiwidHlwIjoiSldUIn0.eyJpZGVudGlmaWVyIjoiYjU4NTQyYTktNjY4Ny00YWM4LWIxYTctYjAyNDRmYzdlOTkzIiwicm90YXRpb25faWQiOiIxOGY0NDQzOS0zY2YwLTQ2ZjQtYTY0My01OThkNDFhYjg3ZDMiLCJwbGF0Zm9ybSI6Ik1MIiwicm90YXRpb25fZGF0ZSI6MTY1MjM2MTg5NiwiZXhwaXJlIjoxNjUyNDQ3Njk2LCJleHAiOjE2NTQ5NTMyOTYsImp0aSI6Ijc2MjdjNDNjLWJlNzItNDgxZC1iNTVkLTk5NzNlNjlkZjQ3ZSIsImlhdCI6MTY1MjM2MTI5Niwic3ViIjoiMWE0ODg4YTBiY2I2YWY5ZGFlZDc5ODhjZGYzMDYzNDdmMjc5OWUxNDg3NTdjODgzOWZlM2U2Y2VkYmViM2RiZiJ9.LzZPqDkcKK9Hy7ol5yudeXjqVl9qShHll2Rg8c2WAC4',
    //         'device-memory': '8',
    //         'downlink': '10',
    //         'dpr': '1',
    //         'ect': '4g',
    //         'if-none-match': 'W/"1e8a2-OwwLDF6mulfoN3nZIByIlvQGz44"',
    //         'rtt': '50',
    //         'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
    //         'sec-ch-ua-mobile': '?0',
    //         'sec-ch-ua-platform': '"Windows"',
    //         'sec-fetch-dest': 'document',
    //         'sec-fetch-mode': 'navigate',
    //         'sec-fetch-site': 'none',
    //         'sec-fetch-user': '?1',
    //         'upgrade-insecure-requests': '1',
    //         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
    //         'viewport-width': '1920',
    //     }
    //     //headers: authHeader(url)
    // };

    // const req = https.request(requestOptions, res => {
    //     console.log(`statusCode: ${res.statusCode}`);
      
    //     res.on('data', d => {
    //         //handleResponse(d);
    //         process.stdout.write(d);
    //     });
    //   });
      
    //   req.on('error', error => {
    //     console.error(error);
    //   });
      
    //   req.end();

//    return fetch(url, requestOptions).then(handleResponse);
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

function handleResponse(response) {
    return response.text().then(text => {
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
    });
}