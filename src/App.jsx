import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Header from './Header';
import Socials from './Socials';

function App() {
  const link = "https://www.github.com/kacijcox";

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
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
