import "../styles/spinner.css";

export default function Spinner({ size = "sm" }) 
{
  return (
    <span className={`spn spn-${size}`}>
      <span className="spn-dot" />
      <span className="spn-dot" />
      <span className="spn-dot" />
    </span>
  );
}