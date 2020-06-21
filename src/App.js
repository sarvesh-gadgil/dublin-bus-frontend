import React from 'react';
import './App.css';
import Navbar from './views/Navbar';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import paths from './paths';

class App extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <Navbar />
        <Switch>
          {paths.map((view) => (
            <Route
              exact
              key={view.path}
              path={view.path}
              component={view.component}
            />
          ))}
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
