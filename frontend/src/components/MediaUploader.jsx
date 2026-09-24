import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Video, Mic, Square, X, Check, Volume2 } from 'lucide-react';
import { uploadMedia } from '../services/api';

export default function MediaUploader({ onMediaAttached, attachedMedia, clearAttachedMedia }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMedia(file, type);
      onMediaAttached(result);
    } catch (err) {
      alert('Failed to upload media file. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `engine_acoustic_${Date.now()}.webm`, { type: 'audio/webm' });

        setUploading(true);
        try {
          const result = await uploadMedia(audioFile, 'audio');
          onMediaAttached(result);
        } catch (err) {
          alert('Failed to process live audio recording.');
        } finally {
          setUploading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or not available in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Hidden file inputs */}
      <input type="file" ref={imageInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'image')} />
      <input type="file" ref={videoInputRef} accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'video')} />
      <input type="file" ref={audioInputRef} accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'audio')} />

      {/* Media Attachment Status Badge */}
      {attachedMedia && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid var(--accent-amber)',
          padding: '8px 12px',
          borderRadius: '10px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Check size={16} color="var(--accent-amber)" />
            <span>
              <strong>{attachedMedia.media_type.toUpperCase()} Attached:</strong> Ready for inspection
            </span>
          </div>
          <button onClick={clearAttachedMedia} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Live Mic Recording Toolbar */}
      {isRecording ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(244, 63, 94, 0.2)',
          border: '1px solid var(--rose-alert)',
          padding: '8px 14px',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="recording-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rose-alert)' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rose-alert)' }}>
              Recording Engine Acoustics... ({recordingTime}s)
            </span>
          </div>
          <button onClick={stopRecording} className="btn-secondary" style={{ padding: '6px 12px', borderColor: 'var(--rose-alert)', color: 'var(--rose-alert)' }}>
            <Square size={14} /> Stop & Attach
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => imageInputRef.current.click()}
            disabled={uploading}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <ImageIcon size={16} color="var(--accent-cyan)" />
            Photo Upload
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={startRecording}
            disabled={uploading}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Mic size={16} color="var(--rose-alert)" />
            Record Engine Sound
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => videoInputRef.current.click()}
            disabled={uploading}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Video size={16} color="var(--accent-amber)" />
            Engine Video
          </button>

          {uploading && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', alignSelf: 'center', marginLeft: '6px' }}>
              Processing Upload...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
