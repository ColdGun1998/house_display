import './App.css';
import Home from './views/home'
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom'
import Scene from './views/scene'

function App() {
  return (
    <Router>
    <div className="App">
      <Routes>
        <Route path='/' element = {<Home/>}/>
        <Route path='/scene'  element = {<Scene/>}/>
      </Routes>
     </div>
    </Router>
  );
}

export default App;
