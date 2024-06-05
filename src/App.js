import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Header from './components/Header';
import Socials from './components/Socials';
import ContactMe from './components/ContactMe';

function App() {

  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-8 mx-auto pt-4">
          <Header />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4"> 
          <Navbar />
        </div>
        <div className="col-md-4 pt-4"> 
          <Socials />
        </div>
      </div>
      <div className="row">
        <div className="col-mx-auto mt-5">
          <ContactMe />
        </div>
      </div>
      <div className="row">
        <div className="col-mx-auto mt-5">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
