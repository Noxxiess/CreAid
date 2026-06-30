import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../assets/creaid.jpg";
import "../styles/menuhub.css";

const FALLBACK_ICON = "fluent-emoji-flat:open-file-folder";

function MenuIcon({ name, size }) 
{
  return (
    <Icon icon={name || FALLBACK_ICON} width={size} height={size} fallback={<Icon icon={FALLBACK_ICON} width={size} height={size} />} />
  );
}

const TOP_LEVEL = [
  {
    key: "calendar",
    label: "Calendar",
    sub: "Appointments & schedule",
    path: "/calendar",
    color: "#3D7DE0",
    iconName: "flat-color-icons:calendar",
  },
  {
    key: "users",
    label: "Users",
    sub: "Staff, patients & logs",
    color: "#8A4FD8",
    iconName: "fluent-emoji-flat:busts-in-silhouette",
    children: [
      { key: "users-all", label: "All Users", sub: "Full user directory", path: "/users", color: "#8A4FD8", iconName: "fluent-emoji-flat:bust-in-silhouette" },
      { key: "users-patients", label: "Patients", sub: "Patient records", path: "/users/patients", color: "#8A4FD8", iconName: "fluent-emoji-flat:adhesive-bandage" },
      { key: "users-dentists", label: "Dentists", sub: "Staff & specialists", path: "/users/dentists", color: "#8A4FD8", iconName: "fluent-emoji-flat:tooth" },
      { key: "users-logs", label: "User Logs", sub: "Activity history", path: "/users/logs", color: "#8A4FD8", iconName: "fluent-emoji-flat:scroll" },
    ],
  },
  {
    key: "payments",
    label: "Payment",
    sub: "Billing & invoices",
    path: "/payments",
    color: "#1C8C8C",
    iconName: "fluent-emoji-flat:credit-card",
  },
  {
    key: "reports",
    label: "Reports",
    sub: "Insights & analytics",
    color: "#3B2E8C",
    iconName: "fluent-emoji-flat:bar-chart",
    children: [
      { key: "reports-summary", label: "Summary", sub: "Overview of all reports", path: "/reports", color: "#3B2E8C", iconName: "fluent-emoji-flat:bar-chart" },
      { key: "reports-daily", label: "Daily Sales", sub: "Day-by-day revenue", path: "/reports/daily", color: "#3B2E8C", iconName: "fluent-emoji-flat:money-bag" },
      { key: "reports-collections", label: "Collections", sub: "Payments collected", path: "/reports/collections", color: "#3B2E8C", iconName: "fluent-emoji-flat:dollar-banknote" },
      { key: "reports-expenses", label: "Expenses & Bills", sub: "Outgoing costs", path: "/reports/expenses", color: "#3B2E8C", iconName: "fluent-emoji-flat:receipt" },
      { key: "reports-appointments", label: "Patient Appointments", sub: "Appointment history", path: "/reports/appointments", color: "#3B2E8C", iconName: "fluent-emoji-flat:spiral-calendar" },
    ],
  },
  {
    key: "system",
    label: "System Data",
    sub: "Records & storage",
    path: "/system",
    color: "#D89A1C",
    iconName: "fluent-emoji-flat:card-index-dividers",
  },
  {
    key: "inbox",
    label: "Inbox",
    sub: "Messages & alerts",
    path: "/inbox",
    color: "#C2541C",
    iconName: "fluent-color:mail-48",
  },
];

function MenuHub() 
{
  const [stack, setStack] = useState([{ items: TOP_LEVEL, title: "Where would you like to go?", subtitle: "Swipe, drag, or use the arrows to browse modules" }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideDirection, setSlideDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const dragStartX = useRef(0);
  const dragMoved = useRef(false);
  const trackRef = useRef(null);
  const animationTimeout = useRef(null);

  const level = stack[stack.length - 1];
  const items = level.items;
  const total = items.length;

  useEffect(() => 
  {
    return () => 
    {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, []);

  const goTo = useCallback(
    (index, direction) => 
    {
      if (isAnimating) return;

      const next = ((index % total) + total) % total;
      if (next === activeIndex) return;

      setSlideDirection(`${direction}-out`);
      setIsAnimating(true);

      if (animationTimeout.current) clearTimeout(animationTimeout.current);

      animationTimeout.current = setTimeout(() => 
      {
        setActiveIndex(next);
        setSlideDirection(`${direction}-in`);

        animationTimeout.current = setTimeout(() => 
        {
          setSlideDirection(null);
          setIsAnimating(false);
        }, 220);
      }, 160);
    },
    [total, activeIndex, isAnimating]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1, "next"), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1, "prev"), [activeIndex, goTo]);

  const handlePointerDown = (e) => 
  {
    if (isAnimating) return;
    setIsDragging(true);
    dragMoved.current = false;
    dragStartX.current = e.clientX;
  };

  const handlePointerMove = (e) => 
  {
    if (!isDragging) return;
    const offset = e.clientX - dragStartX.current;
    if (Math.abs(offset) > 4) dragMoved.current = true;
    setDragOffset(offset);
  };

  const endDrag = () => 
  {
    if (!isDragging) return;
    const threshold = 70;

    if (dragOffset <= -threshold) 
    {
      goNext();
    } 
    else if (dragOffset >= threshold) 
    {
      goPrev();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const enterChildren = (item) => 
  {
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    setStack((prevStack) => [
      ...prevStack,
      { items: item.children, title: item.label, subtitle: item.sub },
    ]);
    setActiveIndex(0);
    setSlideDirection(null);
    setIsAnimating(false);
  };

  const goBack = () => 
  {
    if (stack.length === 1) return;
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    setStack((prevStack) => prevStack.slice(0, -1));
    setActiveIndex(0);
    setSlideDirection(null);
    setIsAnimating(false);
  };

  const handleCardClick = (item, position) => 
  {
    if (dragMoved.current) return;
    if (isAnimating) return;

    if (position === "prev") 
    {
      goPrev();
      return;
    }
    if (position === "next") 
    {
      goNext();
      return;
    }

    if (item.children) 
    {
      enterChildren(item);
      return;
    }

    navigate(item.path);
  };

  const handleKeyDown = (e) => 
  {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "Backspace") goBack();
    if (e.key === "Enter") 
    {
      const current = items[activeIndex];
      if (current.children) 
      {
        enterChildren(current);
      } 
      else 
      {
        navigate(current.path);
      }
    }
  };

  const prevItem = items[(activeIndex - 1 + total) % total];
  const currentItem = items[activeIndex];
  const nextItem = items[(activeIndex + 1) % total];

  const dragShift = isDragging ? dragOffset * 0.25 : 0;
  const isSubLevel = stack.length > 1;

  let trackClass = "menuhub-track";
  if (slideDirection) trackClass += ` menuhub-track-${slideDirection}`;

  return (
    <div className="menuhub-container">
      <div className="menuhub-ambient" style={{ background: `radial-gradient(circle, ${currentItem.color}26 0%, transparent 70%)` }} />

      <div className="menuhub-header">
        {isSubLevel && (
          <button type="button" className="menuhub-back" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back
          </button>
        )}
        <div className="menuhub-brand">
          <img src={logo} alt="DentConnect" className="menuhub-logo" />
          <p className="menuhub-eyebrow">DentConnect</p>
        </div>
        <h2 className="menuhub-heading">{level.title}</h2>
        <p className="menuhub-sub">{level.subtitle}</p>
      </div>

      <div className="menuhub-stage" tabIndex={0} role="group" aria-label="Module carousel" onKeyDown={handleKeyDown}>
        <button type="button" className="menuhub-arrow menuhub-arrow-left" onClick={goPrev} aria-label="Previous module">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <div className="menuhub-viewport">
          <div ref={trackRef} className={trackClass} style={{ transform: !isAnimating ? `translateX(${dragShift}px)` : undefined }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerLeave={endDrag} onPointerCancel={endDrag}>
            <div className="menuhub-card menuhub-card-side menuhub-card-prev" onClick={() => handleCardClick(prevItem, "prev")} style={{ "--accent": prevItem.color }}>
              <div className="menuhub-card-icon"><MenuIcon name={prevItem.iconName} size="32" /></div>
              <p className="menuhub-card-label">{prevItem.label}</p>
            </div>

            <div className="menuhub-card menuhub-card-center" onClick={() => handleCardClick(currentItem, "current")} style={{ "--accent": currentItem.color }}>
              <div className="menuhub-card-glow" />
              {currentItem.children && <span className="menuhub-card-tag">Folder</span>}
              <div className="menuhub-card-icon"><MenuIcon name={currentItem.iconName} size="38" /></div>
              <p className="menuhub-card-label">{currentItem.label}</p>
              <p className="menuhub-card-sub">{currentItem.sub}</p>
              <span className="menuhub-card-cta">
                {currentItem.children ? "View options" : "Open"}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>

            <div className="menuhub-card menuhub-card-side menuhub-card-next" onClick={() => handleCardClick(nextItem, "next")} style={{ "--accent": nextItem.color }}>
              <div className="menuhub-card-icon"><MenuIcon name={nextItem.iconName} size="32" /></div>
              <p className="menuhub-card-label">{nextItem.label}</p>
            </div>
          </div>
        </div>

        <button type="button" className="menuhub-arrow menuhub-arrow-right" onClick={goNext} aria-label="Next module">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="menuhub-dots">
        {items.map((item, i) => (
          <button key={item.key} type="button" className={`menuhub-dot ${i === activeIndex ? "menuhub-dot-active" : ""}`} style={i === activeIndex ? { background: currentItem.color } : undefined} onClick={() => goTo(i, i > activeIndex ? "next" : "prev")} aria-label={`Go to ${item.label}`} />
        ))}
      </div>
    </div>
  );
}

export default MenuHub;