import "../styles/loading.css";
import logo from "../assets/creaid.jpg";

function Loading({ label = "Loading" }) 
{
  return (
    <div className="pgl-overlay">
      <div className="pgl-orbit">
        <span className="pgl-dot pgl-dot1" />
        <span className="pgl-dot pgl-dot2" />
        <span className="pgl-dot pgl-dot3" />
        <div className="pgl-mark"><img src={logo} alt="DentConnect" className="pgl-img" /></div>
      </div>
      <p className="pgl-label">{label}</p>
    </div>
  );
}

export default Loading;


