import '../Styles/Services.css'
import logo from '../assets/logoD.png'
import clinic1 from '../assets/clinic1.png'
import clinic2 from '../assets/clinic2.jpg'
import clinic3 from '../assets/clinic3.jpg'
import { FaHeart } from "react-icons/fa";
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function Services() {
  return (    
    <div>
        <div className="about-page">


        {/* CAROUSEL */}
<div id="carouselExampleCaptions" 
  className="carousel slide"
  data-bs-ride="carousel"
  data-bs-interval="3000">

  <div className="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active"></button>
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1"></button>
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2"></button>
  </div>

  <div className="carousel-inner">

    <div className="carousel-item active">
      <img src={clinic1} className="d-block w-100" alt="slide1" />
      <div className="carousel-caption d-none d-md-block">
        <h5>Dental Cleaning</h5>
        <p>Keep your smile fresh and healthy.</p>
      </div>
    </div>

    <div className="carousel-item">
      <img src={clinic2} className="d-block w-100" alt="slide2" />
      <div className="carousel-caption d-none d-md-block">
        <h5>Tooth Filling</h5>
        <p>Restore damaged teeth effectively.</p>
      </div>
    </div>

    <div className="carousel-item">
      <img src={clinic3} className="d-block w-100" alt="slide3" />
      <div className="carousel-caption d-none d-md-block">
        <h5>Tooth Extraction</h5>
        <p>Safe and professional procedures.</p>
      </div>
    </div>

  </div>

  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
    <span className="carousel-control-prev-icon"></span>
  </button>

  <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
    <span className="carousel-control-next-icon"></span>
  </button>

</div>

<div className="container px-5 py-5 mt-3">
  <div className="row align-items-start">

    
    <div className="col-lg-6 mb-5">
      <h1 className="feature-main-title">
        Book Your Appointment Easily
      </h1>

      <p className="feature-main-text">
        Schedule your dental visit quickly and conveniently. Choose your
        preferred service, pick a date and time, and confirm your appointment
        in just a few clicks. DentConnect ensures a smooth and hassle-free
        booking experience for every patient.
      </p>

      <button className="btn book-btn mt-3 px-5 py-3">
        Book Appointment
      </button>
    </div>

    {/* RIGHT SERVICES GRID */}
    <div className="col-lg-6">
      <div className="row g-4">

        {[
          "Teeth Cleaning",
          "Tooth Extraction",
          "Dental Fillings",
          "Root Canal",
          "Teeth Whitening",
          "Braces Installation",
          "Dental Implants",
          "Dentures",
          "Oral Checkup",
          "Pediatric Dentistry"
        ].map((service, index) => (
          
          <div className="col-md-6" key={index}>
            <div className="service-item d-flex">
              
              <div className="service-icon d-flex align-items-center justify-content-center">
                <FaHeart />
              </div>

              <div className="ms-3">
                <h5 className="service-title">{service}</h5>
                <p className="service-desc">
                  High-quality and professional dental care service.
                </p>
              </div>

            </div>
          </div>

        ))}

      </div>
    </div>

  </div>
</div>


        {/* footer */}
<footer className="custom-footer py-5">
  <div className="container px-5">
    <div className="row align-items-start">

      {/* LEFT (expanded space for paragraph) */}
      <div className="col-md-7 mb-4 pe-md-5">
        <img
          src={logo}
          alt="DentConnect Logo"
          width="350"
          className="mb-3"
        />

        <p className="text-light footer-desc">
          DentConnect is designed to provide a seamless and patient-centered
          dental care experience by connecting patients with trusted dental
          services, appointments, and clinic support.
        </p>
      </div>

      {/* RIGHT (slightly reduced width, aligned right) */}
      <div className="col-md-5 d-flex justify-content-md-end">
        <div className="row w-100 justify-content-md-end">

          {/* QUICK LINKS */}
          <div className="col-6 text-md-end mb-6">
            <h5 className="text-white fw-bold mb-3">Quick Links</h5>

            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/Services" className="footer-link">Our Services</Link></li>
              <li><Link to="/Aboutus" className="footer-link">About Us</Link></li>
              <li><Link to="/Contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/terms" className="footer-link">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* FOLLOW US */}
          <div className="col-6 text-md-end mb-6">
            <h5 className="text-white fw-bold mb-3">Follow Us</h5>

            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><a href="#" className="footer-link">Facebook</a></li>
              <li><a href="#" className="footer-link">Instagram</a></li>
              <li><a href="#" className="footer-link">Twitter</a></li>
              <li><a href="#" className="footer-link">Email Us</a></li>

              <li>
                <Link to="/login">
                  <button className="signup-btn">
                  Log In
                  </button>
                  </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>

    <hr className="border-light" />

    <div className="text-center text-light">
      <small>© 2026 DentConnect. All Rights Reserved.</small>
    </div>
  </div>
</footer>
</div>
          </div>
  )
}
