import { useState } from "react";
import "../styles/inbox.css";

function Inbox() 
{
  const [conversations] = useState([
    {
      id: 1,
      name: "Chelsea B. Tumbakal",
      preview: "Hi, can you help me...",
      time: "2:00 PM"
    },
    {
      id: 2,
      name: "Odin G. Mayora",
      preview: "Regarding my last appointment...",
      time: "Yesterday"
    },
    {
      id: 3,
      name: "Veef C. Ubes",
      preview: "Can you confirm with a specialist...",
      time: "03/15/26"
    }
  ]);

  return (
    <div className="admin-container">
      <div className="admin-main">
        <div className="dashboard-content">
          <div className="inbox-container">
            <div className="inbox-sidebar">
              <h2 className="inbox-title">Inbox</h2>

              <input
                className="inbox-search"
                placeholder="Search"
              />

              <div className="conversation-list">
                {conversations.map((c) => (
                  <div key={c.id} className="conversation-item">
                    <div className="avatar"></div>

                    <div className="conversation-info">
                      <div className="conversation-top">
                        <span className="name">{c.name}</span>
                        <span className="time">{c.time}</span>
                      </div>
                      <p className="preview">{c.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-panel">
              <div className="chat-empty">
                Select a conversation to view messages
              </div>

              <div className="chat-input">
                <input placeholder="Type a message..." />
                <button className="send-btn">➤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inbox;