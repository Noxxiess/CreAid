import './Navbar.css'
import logo from './assets/logoD.png'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container px-5">

          <Link className="navbar-brand" to="/">
            <img
              src={logo}
              alt="logo"
              width="200"
              height="65"
            />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">

              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/services">Our Services</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/aboutus">About Us</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/contact">Contact Us</Link>
              </li>

            </ul>
          </div>

        </div>
      </nav>

    </div>
  )
}
