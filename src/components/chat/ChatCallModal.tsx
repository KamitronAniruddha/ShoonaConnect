import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
} from 'lucide-react';
import { CallRecord } from '../../types';
import { playRingtoneSound, stopRingtoneSound } from '../../utils/chatService';

interface ChatCallModalProps {
  call: CallRecord | null;
  isIncoming: boolean;
  partnerName: string;
  partnerPhoto?: string;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: (durationSeconds: number) => void;
}

export const ChatCallModal: React.FC<ChatCallModalProps> = ({
  call,
  isIncoming,
  partnerName,
  partnerPhoto,
  onAnswer,
  onDecline,
  onEndCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call?.type === 'video');
  const [seconds, setSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Sound effects during ringing
  useEffect(() => {
    if (call?.status === 'ringing') {
      playRingtoneSound();
    } else {
      stopRingtoneSound();
    }
    return () => {
      stopRingtoneSound();
    };
  }, [call?.status]);

  // Call duration counter
  useEffect(() => {
    let timer: any = null;
    if (call?.status === 'connected') {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [call?.status]);

  // Request media stream if video call
  useEffect(() => {
    if (call?.type === 'video' && call.status === 'connected') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or not available, gracefully fallback
        });
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [call?.status, call?.type]);

  if (!call) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    stopRingtoneSound();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    onEndCall(seconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-slate-900 border border-rose-500/20 shadow-2xl p-6 flex flex-col items-center text-center text-white relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Video feed or avatar display */}
        {call.type === 'video' && call.status === 'connected' ? (
          <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 relative mb-4 border border-slate-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected with {partnerName}
            </div>
          </div>
        ) : (
          <div className="relative my-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-rose-500/30 overflow-hidden bg-slate-800 shadow-xl flex items-center justify-center relative">
              {partnerPhoto ? (
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-rose-300">
                  {partnerName ? partnerName[0].toUpperCase() : '💕'}
                </span>
              )}
            </div>

            {call.status === 'ringing' && (
              <span className="absolute -inset-2 rounded-full border border-rose-400/50 animate-ping pointer-events-none" />
            )}
          </div>
        )}

        <h3 className="text-xl font-bold tracking-tight mb-1">{partnerName}</h3>

        <div className="text-xs text-rose-300 font-medium mb-6 flex items-center gap-1.5">
          {call.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          {call.status === 'ringing'
            ? isIncoming
              ? `Incoming ${call.type} call...`
              : `Calling ${partnerName}...`
            : `Call in progress • ${formatDuration(seconds)}`}
        </div>

        {/* Actions bar */}
        {call.status === 'ringing' && isIncoming ? (
          <div className="flex items-center gap-6 mt-2">
            {/* Decline */}
            <button
              onClick={() => {
                stopRingtoneSound();
                onDecline();
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/90 group-hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-slate-300 font-medium">Decline</span>
            </button>

            {/* Accept */}
            <button
              onClick={() => {
                stopRingtoneSound();
                onAnswer();
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 group-hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110 animate-pulse">
                {call.type === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </div>
              <span className="text-[11px] text-emerald-300 font-medium">Accept</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            {/* Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                isMuted ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video toggle */}
            {call.type === 'video' && (
              <button
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                  !isVideoEnabled ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {!isVideoEnabled ? <VideoOff className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            {/* Hangup */}
            <button
              onClick={handleEnd}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-105 cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
