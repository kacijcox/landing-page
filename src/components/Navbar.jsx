import React from "react";
import "./Navbar.css"

const Navbar = () => {
    return ( 
        <div className="links">
            <hr />
            <p className="navbar-title">projects</p>
            <a href="https://sage-stop-nine.vercel.app/">sage stop</a>
            <a href="https://luxury-bridal.vercel.app">the luxury bridal</a>
            <a href="https://chromewebstore.google.com/detail/dnspector/lfelimmkjkhbbcokjocdeelbnpkicihd">DNSpector</a>
            <hr />
        </div>
    );
}
 
export default Navbar;
