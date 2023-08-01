import logo from './logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import HmacBuilder from './components/hamc-builder';

function App() {
  return (
    <div>
      <div className='header'>
        <Row>
          <Col>
            <img src={logo} alt="Logo" className='logo' />
          </Col>
        </Row>
      </div>
      <HmacBuilder />
    </div>
  );
}

export default App;
