import '../Styles/Aboutus.css'
import logo from '../assets/logoD.png'
import clinic1 from '../assets/clinic1.png'
import clinic2 from '../assets/clinic2.jpg'
import clinic3 from '../assets/clinic3.jpg'
import logoF from '../assets/logoF.png'
import background from '../assets/background.png'
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'


export default function Aboutus() {
  return (    
    <div>
      <div className="about-page">
        
        <div className="about-section container px-5">

     <div className="container-about">
        <div className="about-us-desc mt-5">
            <h1>What is Juana Smile?</h1>
            <p>Juana Smile Dental Clinic is committed to providing high-quality and 
                patient-centered dental care in a comfortable and welcoming environment. 
                Our team of skilled professionals offers a wide range of services, 
                from preventive care to advanced treatments, ensuring every patient 
                receives personalized attention and reliable solutions for their oral 
                health needs. At Juana Smile, we strive to create confident, healthy smiles 
                through compassionate care and modern dental practices.</p>
        </div>
        </div>

        <div className="mission-vision-section">

  {/* MISSION */}
  <div className="mv-block mission-block">
    <div className="mv-content">
      <h6>OUR MISSION</h6>
      <p>
        Collaboratively administrate empowered markets via plug-and-play networks.
        Dynamically procrastinate B2C users after installed base benefits.
        Dramatically visualize customer directed convergence without revolutionary ROI.
      </p>
      <p>
        Efficiently unleash cross-media information without cross-media value.
        Quickly maximize timely deliverables for real-time schemas.
        Dramatically maintain clicks-and-mortar solutions without functional solutions.
      </p>
    </div>
  </div>

  {/* VISION */}
  <div className="mv-block vision-block">
    <div className="mv-content">
      <h6>OUR VISION</h6>
      <p>
        Collaboratively administrate empowered markets via plug-and-play networks.
        Dynamically procrastinate B2C users after installed base benefits.
        Dramatically visualize customer directed convergence without revolutionary ROI.
      </p>
      <p>
        Efficiently unleash cross-media information without cross-media value.
        Quickly maximize timely deliverables for real-time schemas.
        Dramatically maintain clicks-and-mortar solutions without functional solutions.
      </p>
    </div>
  </div>

</div>

  {/* BIG IMAGE */}
  <div className="about-image">
    <img src={logoF} alt="logoF" />
  </div>

<div className="team-section">
  <div className="team-card">
    <img src={clinic1} alt="" />
    <div className="team-overlay">
      <h5>Dr. Raymond Bell</h5>
      <span>Orthodontist</span>
    </div>
  </div>

  <div className="team-card">
    <img src={clinic2} alt="" />
    <div className="team-overlay">
      <h5>Dr. Jarrett Williams</h5>
      <span>Dental Surgeon</span>
    </div>
  </div>

  <div className="team-card">
    <img src={clinic3} alt="" />
    <div className="team-overlay">
      <h5>Dr. Louis Smith</h5>
      <span>Cosmetic Dentist</span>
    </div>
  </div>

  <div className="team-card">
    <img src={clinic1} alt="" />
    <div className="team-overlay">
      <h5>Dr. Oralee Dunbar</h5>
      <span>Pediatric Dentist</span>
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
