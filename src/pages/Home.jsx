import '../styles/Home.css'
import logo from '../assets/logoD.png'
import creaid from '../assets/creaid.jpg'
import background from '../assets/background.png'
import clinic1 from '../assets/clinic1.png'
import clinic2 from '../assets/clinic2.jpg'
import clinic3 from '../assets/clinic3.jpg'
import clinic4 from '../assets/clinic4.jpg'
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="hero">

      {/* HERO SECTION */}
      <div className="hero-content container px-4 py-5">
        <div className="row align-items-center py-5">

          <div className="col-md-6 mt-4 text-start d-flex flex-column gap-3 px-4">

            <h1>Welcome to DentConnect</h1>

            <p>
              Introducing DentConnect, a new application designed to enhance your overall dental care experience.
              Developed under Juana Smile and Creaid, DentConnect aims to provide a more seamless, efficient,
              and patient-centered approach to dental services.
            </p>

            <button className="btn btn-primary w-50 py-3">
              Download Now
            </button>

            <a href="#" className="text-decoration-none">
              Any Concerns? Contact Us →
            </a>

          </div>

          <div className="col-md-6 text-center px-3">
            <img
              src={creaid}
              alt="hero"
              className="img-fluid"
              style={{ width: "90%", marginLeft: "9%" }}
            />
          </div>

        </div>
      </div>

      {/*CLINIC*/}
      <div className="hero2 mt-5">
  < div className="hero2-overlay">
  <div className="container px-5 hero2-inner">
      <h1>Juana Smile Dental Clinic</h1>

      <p>
        Committed to providing comfortable, reliable,
        and patient-focused care for maintaining healthy and confident smiles.
      </p>

      <div className="hero2-buttons">

  <Link to="/Services" className="btn btn-primary">
    Our Services
  </Link>

  <Link to="/Appointment" className="btn btn-outline-light">
    Book Appointment
  </Link>

</div>

    </div>
  </div>
</div>

      {/* DESCRIPTION */}
      <div className="description">
        <h1>Explore More</h1>
        <p>
          Explore More provides additional information about our dental
          services, clinic offerings, and patient care solutions to help you
          better understand and manage your oral health needs.
        </p>
      </div>

      {/* CARDS SECTION */}
      <div className="cards container px-5 pb-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">

          <div className="col">
            <div className="card h-100 custom-card">
              <img src={clinic2} className="card-img-top custom-img" alt="clinic 2" />
              <div className="card-body d-flex flex-column gap-2">
                <h5 className="card-title">Our Services</h5>
                <p className="card-text">
                  Discover the wide range of dental treatments and oral care solutions we provide, 
                  including cleaning, fillings, extractions, and other professional dental services 
                  for a healthier smile.
                </p>
                <Link to="/Services" className="card-btn mt-auto py-2 text-decoration-none">
                Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 custom-card">
              <img src={clinic3} className="card-img-top custom-img" alt="clinic 3" />
              <div className="card-body d-flex flex-column gap-2">
                <h5 className="card-title">Reach Us</h5>
                <p className="card-text">
                  Get in touch with us for inquiries, assistance, clinic schedules, 
                  and other important information to help you with your dental care needs.
                </p>
                <Link to="/Contact" className="card-btn mt-auto py-2 text-decoration-none">
                Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 custom-card">
              <img src={clinic4} className="card-img-top custom-img" alt="clinic 4" />
              <div className="card-body d-flex flex-column gap-2">
                <h5 className="card-title">Appointment</h5>
                <p className="card-text">
                  Schedule your dental visits quickly and conveniently through our 
                  appointment system, ensuring a smooth and hassle-free booking experience.
                </p>
                <button className="card-btn mt-auto py-2">
                  Learn More
                </button>
              </div>
            </div>
          </div>

        </div>
</div>

{/* footer */}
<footer className="custom-footer py-5 mt-5">
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
              <li><Link to="/Terms" className="footer-link">Terms and Conditions</Link></li>
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

  )
}
