import config from './config';

function request (config, params, params2) {
    let method = config.method || 'POST';
    let headers = config.headers || new Headers({
        "Accept": 'application/json;charset=utf-8',
        'Content-Type': 'application/json'
    });
    let url = config.url;
    let body = '';
    if (typeof params === 'string' && typeof params2 === 'object') {
        url  += '?' + params;
        if (params2 instanceof FormData) {
            body = params2;
        } else {
            body = JSON.stringify(params2);
        }
    } else if (typeof params === 'string') {
        url  += '?' + params;
    } else if (typeof params === 'object') {
        body = JSON.stringify(params);
    }
    return fetch(url, {
        method: method,
        headers: headers,
        body: body
    }).then(res => {
        if (res.ok) {
            return res.json();
        }
    }).catch(error => {
        console.error(`请求出错：${error.message}`);
    });
}

const api = {};

Object.keys(config).forEach(key => {
    api[key] = function (params, params2) {
        return request(config[key], params, params2);
    }
});

export default api;