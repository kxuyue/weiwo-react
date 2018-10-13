import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'mobx-react';
import Store from './store';
import App from './routes';
import 'react-app-polyfill/ie9';
import './styles/index.less';


ReactDOM.render(<Provider store={new Store()}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
