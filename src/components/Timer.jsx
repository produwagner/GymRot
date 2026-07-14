import React, { useEffect, useState, useRef } from "react";
import { PlayIcon, PauseIcon, SkipIcon, ClockIcon } from "./Icons";

// Icons locais para minimizar/maximizar
const MinimizeIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="10" y1="14" x2="3" y2="21" />
  </svg>
);

const MaximizeIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);

export default function Timer({ duration, onFinish, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);

  // Play a soft beep sound using Web Audio API (no external file needed!)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Beep 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.3);

      // Beep 2 (delayed)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6 note
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 300);

      // Vibrate device if supported
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.log("Audio contexts not supported/allowed yet by browser policy:", e);
    }
  };

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(true);
  }, [duration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      playBeep();
      onFinish();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, onFinish]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const add30Seconds = () => {
    setTimeLeft((prev) => prev + 30);
  };

  const skipTimer = () => {
    clearInterval(timerRef.current);
    onFinish();
  };

  // Circular progress calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`timer-overlay-wrapper ${isMinimized ? "is-minimized" : "is-maximized"} animate-fade-in`}>
      {!isMinimized ? (
        <div className="timer-modal glass animate-slide-up">
          <div className="timer-header">
            <div className="timer-header-title">
              <ClockIcon size={20} className="timer-header-icon" />
              <span>Timer de Descanso</span>
            </div>
            <button className="btn-minimize" onClick={() => setIsMinimized(true)} title="Minimizar">
              <MinimizeIcon size={18} />
            </button>
          </div>

          {/* Circular Countdown */}
          <div className="timer-circle-container">
            <svg className="timer-svg" width="140" height="140">
              <circle
                className="timer-circle-bg"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth="6"
              />
              <circle
                className="timer-circle-progress"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="timer-digits">{formatTime(timeLeft)}</div>
          </div>

          <div className="timer-controls">
            <button className="btn btn-secondary btn-circle" onClick={toggleTimer}>
              {isActive ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            
            <button className="btn btn-primary btn-pill" onClick={add30Seconds}>
              +30s
            </button>

            <button className="btn btn-secondary btn-circle" onClick={skipTimer}>
              <SkipIcon size={20} />
            </button>
          </div>

          <button className="btn-cancel-timer" onClick={onCancel}>
            Pular Descanso
          </button>
        </div>
      ) : (
        <div className="timer-bar-top glass animate-slide-down">
          <div className="timer-bar-info">
            <ClockIcon size={16} className="timer-header-icon animate-pulse" />
            <span className="timer-bar-label">Descanso:</span>
            <span className="timer-bar-digits">{formatTime(timeLeft)}</span>
          </div>

          <div className="timer-bar-controls">
            <button className="btn-bar-control btn-circle-sm" onClick={toggleTimer} title={isActive ? "Pausar" : "Iniciar"}>
              {isActive ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </button>
            <button className="btn-bar-control btn-pill-sm" onClick={add30Seconds}>
              +30s
            </button>
            <button className="btn-bar-control btn-circle-sm" onClick={skipTimer} title="Pular descanso">
              <SkipIcon size={14} />
            </button>
          </div>

          <div className="timer-bar-actions">
            <button className="btn-bar-action" onClick={() => setIsMinimized(false)} title="Maximizar">
              <MaximizeIcon size={16} />
            </button>
          </div>

          {/* Linear Progress Bar at the bottom of the top bar */}
          <div className="timer-bar-progress-bg">
            <div 
              className="timer-bar-progress-fill" 
              style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
          </div>
        </div>
      )}

      <style>{`
        .timer-overlay-wrapper.is-maximized {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(31, 31, 31, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .timer-overlay-wrapper.is-minimized {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          pointer-events: none;
        }

        .timer-modal {
          width: 100%;
          max-width: 320px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .timer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          color: var(--color-text-secondary);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .timer-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-minimize {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }

        .btn-minimize:hover {
          background: var(--border-color);
          color: var(--color-text-primary);
        }

        .timer-header-icon {
          color: var(--accent-purple);
        }

        .timer-circle-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .timer-svg {
          transform: rotate(-90deg);
        }

        .timer-circle-bg {
          fill: none;
          stroke: #f1f3f4;
        }

        .timer-circle-progress {
          fill: none;
          stroke: var(--accent-purple);
          transition: stroke-dashoffset 1s linear;
        }

        .timer-digits {
          position: absolute;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-title);
          letter-spacing: -0.02em;
        }

        .timer-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          width: 100%;
          justify-content: center;
        }

        .btn-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          padding: 0;
        }

        .btn-pill {
          padding: 10px 20px;
          font-size: 0.95rem;
          border-radius: 99px;
        }

        .btn-cancel-timer {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }

        .btn-cancel-timer:hover {
          color: var(--status-error);
        }

        /* Estilos da Barra de Descanso (Minimizada) */
        .timer-bar-top {
          pointer-events: auto;
          width: 100%;
          height: 56px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          position: relative;
          z-index: 1001;
        }

        .timer-bar-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .timer-bar-label {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .timer-bar-digits {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-title);
        }

        .timer-bar-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-bar-control {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--color-text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-bar-control:hover {
          background: var(--border-color);
          border-color: var(--color-text-secondary);
        }

        .btn-circle-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .btn-pill-sm {
          height: 32px;
          padding: 0 12px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .timer-bar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-bar-action {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }

        .btn-bar-action:hover {
          background: var(--border-color);
          color: var(--color-text-primary);
        }

        .timer-bar-progress-bg {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--border-color);
        }

        .timer-bar-progress-fill {
          height: 100%;
          background: var(--accent-purple);
          transition: width 1s linear;
        }

        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
