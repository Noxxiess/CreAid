import { useState, useEffect, useRef } from "react";
import "../styles/inbox.css";
import { supabase } from "../lib/supabase";

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          if (selectedConversation) loadMessages(selectedConversation.id);
          loadConversations();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(otherUserId) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (error) { console.error(error); return; }
      setMessages(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadConversations() {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, role, avatar_url")
        .in("role", ["patient", "dentist"])
        .eq("is_archived", false);

      if (error) { console.error(error); return; }

      const conversationsWithPreview = await Promise.all(
        (users || []).map(async (user) => {
          const { data: latestMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .or(
              `and(sender_id.eq.${currentUserId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUserId})`
            )
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: unreadMessages } = await supabase
            .from("messages")
            .select("id")
            .eq("sender_id", user.id)
            .eq("receiver_id", currentUserId)
            .eq("read", false);

          return {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            avatar_url: user.avatar_url,
            unread: unreadMessages?.length || 0,
            preview: latestMessage?.content || "No messages yet",
            time: latestMessage?.created_at || "",
          };
        })
      );

      setConversations(
        conversationsWithPreview.sort(
          (a, b) => new Date(b.time || 0) - new Date(a.time || 0)
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function formatConversationTime(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString())
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  function formatMessageTime(dateValue) {
    return new Date(dateValue).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateSeparator(dateValue) {
    const date = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function shouldShowDateSeparator(currentMessage, previousMessage) {
    if (!previousMessage) return true;
    return (
      new Date(currentMessage.created_at).toDateString() !==
      new Date(previousMessage.created_at).toDateString()
    );
  }

  async function handleSelectConversation(c) {
    setSelectedConversation(c);
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", c.id)
      .eq("receiver_id", currentUserId)
      .eq("read", false);
    loadMessages(c.id);
    loadConversations();
  }

  async function handleSend() {
    if (!message.trim() || !selectedConversation) return;
    const content = message.trim();
    setMessage("");

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedConversation.id,
      content,
      read: false,
    });

    if (error) { console.error(error); return; }

    await supabase.from("notifications").insert({
      user_id: selectedConversation.id,
      type: "message",
      title: "New Message",
      content: `${currentUser?.first_name || "Staff"} sent you a message.`,
      read: false,
    });

    await loadMessages(selectedConversation.id);
    await loadConversations();
  }

  return (
    <div className="admin-container">
      <div className="admin-main">
        <div className="dashboard-content">
          <div className="inbox-container">

            {/* ── SIDEBAR ── */}
            <div className="inbox-sidebar">
              <div className="sidebar-header">
                <h2 className="inbox-title">Inbox</h2>
                <div className="inbox-search-wrap">
                  <svg
                    className="inbox-search-icon"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    className="inbox-search"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="conversation-list">
                {filteredConversations.map((c) => (
                  <div
                    key={c.id}
                    className={`conversation-item ${
                      selectedConversation?.id === c.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectConversation(c)}
                  >
                    {c.avatar_url ? (
                      <img src={c.avatar_url} className="avatar" alt="" />
                    ) : (
                      <div className="avatar-placeholder">
                        {c.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}

                    <div className="conversation-info">
                      <div className="conversation-top">
                        <span className="name">{c.name}</span>
                        <span className="time">
                          {formatConversationTime(c.time)}
                        </span>
                      </div>
                      <div className="conversation-bottom">
                        <p className="preview">{c.preview}</p>
                        {c.unread > 0 && (
                          <span className="unread-badge">{c.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CHAT PANEL ── */}
            <div className="chat-panel">
              {!selectedConversation ? (
                <div className="chat-empty">
                  Select a conversation to view messages
                </div>
              ) : (
                <>
                  <div className="chat-header">
                    {selectedConversation.avatar_url ? (
                      <img
                        src={selectedConversation.avatar_url}
                        className="avatar"
                        alt=""
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedConversation.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="chat-header-info">
                      <h3>
                        {selectedConversation.name}
                        <span
                          className={`role-tag ${
                            selectedConversation.role === "dentist"
                              ? "role-dentist"
                              : "role-patient"
                          }`}
                        >
                          {selectedConversation.role}
                        </span>
                      </h3>
                      <span>Active now</span>
                    </div>
                    <div className="online-dot" title="Online" />
                  </div>

                  <div className="messages-area">
                    {messages.map((msg, index) => {
                      const isStaff = msg.sender_id === currentUserId;
                      const showDate = shouldShowDateSeparator(
                        msg,
                        messages[index - 1]
                      );

                      return (
                        <div key={msg.id || index}>
                          {showDate && (
                            <div className="date-separator">
                              <span>
                                {formatDateSeparator(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`message-row ${
                              isStaff ? "staff-row" : "other-row"
                            }`}
                          >
                            <div
                              className={`message-bubble ${
                                isStaff ? "staff" : "other"
                              }`}
                            >
                              <div className="message-text">{msg.content}</div>
                              <div className="message-meta">
                                {formatMessageTime(msg.created_at)}
                                {isStaff && (
                                  <span className="message-status">
                                    {msg.read ? "✓✓ Seen" : "✓ Delivered"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input">
                    <input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button className="send-btn" onClick={handleSend}>
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Inbox;