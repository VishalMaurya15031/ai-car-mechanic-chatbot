const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health/`);
    return await res.json();
  } catch (err) {
    console.error('Health check error:', err);
    return { status: 'offline' };
  }
}

export async function sendMessage(conversationId, text, mediaId = null) {
  const payload = {
    conversation_id: conversationId,
    text: text,
    media_id: mediaId
  };

  const res = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Failed to send message: ${res.statusText}`);
  }

  return await res.json();
}

export async function uploadMedia(file, mediaType = 'image') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('media_type', mediaType);

  const res = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`Failed to upload media: ${res.statusText}`);
  }

  return await res.json();
}

export async function generateDiagnosis(conversationId) {
  const res = await fetch(`${API_BASE_URL}/diagnosis/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conversation_id: conversationId })
  });

  if (!res.ok) {
    throw new Error(`Failed to generate diagnosis: ${res.statusText}`);
  }

  return await res.json();
}

export async function createBooking(bookingData) {
  const res = await fetch(`${API_BASE_URL}/booking/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });

  if (!res.ok) {
    throw new Error(`Failed to create booking: ${res.statusText}`);
  }

  return await res.json();
}

export async function getBookingDetails(bookingId) {
  const res = await fetch(`${API_BASE_URL}/booking/${bookingId}/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch booking details: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchConversations() {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return [];
  }
}

export async function fetchConversationDetails(conversationId) {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch conversation details`);
  }
  return await res.json();
}
