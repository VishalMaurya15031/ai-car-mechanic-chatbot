import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatContainer from './components/ChatContainer';
import DiagnosisCard from './components/DiagnosisCard';
import BookingModal from './components/BookingModal';
import BookingTracker from './components/BookingTracker';
import HistoryDrawer from './components/HistoryDrawer';

import {
  sendMessage,
  generateDiagnosis,
  fetchConversations,
  fetchConversationDetails,
  checkHealth
} from './services/api';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [attachedMedia, setAttachedMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.body.className = `theme-${nextTheme}`;
  };

  // Load Past Conversations on Mount
  useEffect(() => {
    document.body.className = 'theme-dark';
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const list = await fetchConversations();
    setConversations(list);
  };

  const handleSelectSession = async (convId) => {
    try {
      setLoading(true);
      const data = await fetchConversationDetails(convId);
      setCurrentConversationId(data.id);
      setCurrentSessionTitle(data.title);
      setMessages(data.messages || []);
      setLatestDiagnosis(data.latest_diagnosis || null);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setCurrentConversationId(null);
    setCurrentSessionTitle('New Diagnostic Session');
    setMessages([]);
    setLatestDiagnosis(null);
    setAttachedMedia(null);
  };

  const handleSendMessage = async (text, mediaId = null) => {
    setLoading(true);

    // Optimistic User Message
    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: text || '[Uploaded Attachment]',
      media: attachedMedia
    };
    setMessages((prev) => [...prev, userMsgObj]);

    try {
      const response = await sendMessage(currentConversationId, text, mediaId || (attachedMedia ? attachedMedia.id : null));

      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id);
      }

      // Add Assistant Message
      const assistantMsg = response.assistant_message;
      setMessages((prev) => [...prev, assistantMsg]);

      // Set Diagnosis if returned
      if (response.diagnosis) {
        setLatestDiagnosis(response.diagnosis);
      }

      // Clear Attached Media
      setAttachedMedia(null);
      loadHistory();
    } catch (err) {
      alert('Failed to connect to Mechanic API. Make sure backend Django server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        toggleHistory={() => setHistoryOpen(true)}
        currentSessionTitle={currentSessionTitle}
      />

      {/* Main Split Content */}
      <div className="main-content">
        {/* Left: Chat Thread */}
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
          attachedMedia={attachedMedia}
          onMediaAttached={(media) => setAttachedMedia(media)}
          clearAttachedMedia={() => setAttachedMedia(null)}
        />

        {/* Right: Diagnosis Card & Active Booking Sidebar */}
        <div className="side-panel">
          <DiagnosisCard
            diagnosis={latestDiagnosis}
            onOpenBooking={() => setBookingModalOpen(true)}
          />

          <BookingTracker booking={activeBooking} />
        </div>
      </div>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Booking Form Modal */}
      {bookingModalOpen && (
        <BookingModal
          diagnosis={latestDiagnosis}
          onClose={() => setBookingModalOpen(false)}
          onBookingComplete={(bookingRes) => {
            setActiveBooking(bookingRes);
            setBookingModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
