import React from 'react';
import ReactDOM from 'react-dom';
import Notice from './Notice';

let called = false;

Notice.open = function (props) {
    if (called) return;
    called = true;
    let div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(<Notice {...props} />, div);
}

export default Notice;