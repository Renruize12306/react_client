import {BrowserRouter, Switch, Route} from 'react-router-dom';
import DashboardComponent from './components/DashboardComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={DashboardComponent} />
          </Switch>
        </BrowserRouter>
      </div>
      </header>
    </div>
  );
}

export default App;
