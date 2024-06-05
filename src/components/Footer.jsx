import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="text-white py-4 mt-0 mb-0">
      <div className="container">
        <div className="row mt-1">
          <div className="col-12 text-center">
            <p className="footer-text">
              kacicox.com
            </p>
            <a className="logo" href="https://kacicox.com" target="_blank" rel="noopener noreferrer">d&d by kaci</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
