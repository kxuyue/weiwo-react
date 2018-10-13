import React from 'react';
import ReactDOM from 'react-dom';
import Modal from './Modal';

Modal.open = function (props) {
    let div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(<Modal {...props} />, div);
}

export default Modal;