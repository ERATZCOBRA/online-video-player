import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import "./App.css";

function App() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // 🔁 Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // ⏩ Forward 10 seconds
  const handleForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  }, []);

  // ⏪ Rewind 10 seconds
  const handleRewind = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  }, []);

  // 🔊 Volume toggle
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // 🎚️ Progress bar change
  const handleProgressChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
    setProgress(value);
  }, []);

  // ⏱️ Update progress bar while playing
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  // 📏 Load metadata to set duration
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  // ⌨️ Keyboard shortcuts (spacebar, arrows)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      } else if (event.code === "ArrowRight") {
        handleForward();
      } else if (event.code === "ArrowLeft") {
        handleRewind();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, handleForward, handleRewind]);

  // 🎧 Effect to update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 flex flex-col items-center shadow-2xl">
        <Music className="w-16 h-16 text-indigo-400 mb-4" />
        <h1 className="text-white text-2xl font-semibold mb-2">
          Lo-Fi Chill Beats
        </h1>
        <p className="text-gray-400 text-sm mb-4">Relax • Focus • Study</p>

        <audio
          ref={audioRef}
          src="/audio.mp3"
          onTimeUpdate={updateProgress}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2 mb-4">
          <span className="text-gray-400 text-xs w-8 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={progress}
            onChange={handleProgressChange}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-gray-400 text-xs w-8">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleRewind}
            className="text-gray-300 hover:text-indigo-400 transition"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlayPause}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-4 shadow-md transition"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleForward}
            className="text-gray-300 hover:text-indigo-400 transition"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
