import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers/reducer';
import thunk from 'redux-thunk';
import { checkAuthentication } from './actions/action';

const store = createStore(reducer, applyMiddleware(thunk));

(async () => {
  if (localStorage.authToken) {
    await store.dispatch(checkAuthentication(localStorage.authToken));
  }

  ReactDOM.render(<Provider store={store}><App /></Provider>,
    document.getElementById('root')
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
})();
