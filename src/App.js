import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [playingUrl, setPlayingUrl] = useState('');
  const [isFile, setIsFile] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [controlsVisible, setControlsVisible] = useState(true);

  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const handlePlay = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');

    try {
      new URL(url);
      const isDirectFile = /\.(mp4|webm|ogg|m4v|avi|mov|mkv)$/i.test(url);
      setPlayingUrl(url);
      setIsFile(isDirectFile);
      setPlaying(true);
    } catch (e) {
      setError('Invalid URL');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    setPlaying(false);
    if (isFile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } else if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
    }

    setTimeout(() => {
      setPlayingUrl('');
      setUrl('');
      setIsFile(false);
    }, 100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error('Fullscreen error:', err));
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (e) {
        console.error('PiP error:', e);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (isFile && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else {
      playerRef.current?.seekTo(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isFile && videoRef.current) {
      videoRef.current.volume = newVol;
    }
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  // Hide controls after 3s inactivity
  const resetHideTimer = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetHideTimer);
      container.addEventListener('click', resetHideTimer);
    }
    resetHideTimer();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', resetHideTimer);
        container.removeEventListener('click', resetHideTimer);
      }
      clearTimeout(hideTimerRef.current);
    };
  }, [playingUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playingUrl) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isFile && videoRef.current) {
            videoRef.current.paused
              ? videoRef.current.play()
              : videoRef.current.pause();
          } else {
            setPlaying((prev) => !prev);
          }
          break;
        case 'ArrowRight':
          if (isFile && videoRef.current) videoRef.current.currentTime += 5;
          else playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 5);
          break;
        case 'ArrowLeft':
          if (isFile && videoRef.current) videoRef.current.currentTime -= 5;
          else playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 5);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyP':
          togglePiP();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingUrl, isFile]);

  useEffect(() => {
    if (isFile && videoRef.current) {
      const vid = videoRef.current;
      const updateProgress = () => setProgress(vid.currentTime);
      const updateDuration = () => setDuration(vid.duration);
      vid.addEventListener('timeupdate', updateProgress);
      vid.addEventListener('loadedmetadata', updateDuration);
      return () => {
        vid.removeEventListener('timeupdate', updateProgress);
        vid.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [isFile]);

  return (
    <div className="app">
      <div className="player-container" ref={containerRef}>
        <h1 className="title">Video Player</h1>

        <input
          type="text"
          placeholder="Paste a YouTube or direct video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="buttons">
          <button onClick={handlePlay}>▶ Play</button>
          <button onClick={handleStop}>■ Stop</button>
          <button onClick={toggleFullscreen}>⛶ Fullscreen</button>
          {isFile && <button onClick={togglePiP}>📺 PiP</button>}
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {playingUrl && (
          <div className="video-box">
            {isFile ? (
              <div className="custom-player">
                <video
                  ref={videoRef}
                  src={playingUrl}
                  autoPlay
                  preload="auto"
                  onClick={() =>
                    videoRef.current.paused
                      ? videoRef.current.play()
                      : videoRef.current.pause()
                  }
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    objectFit: 'contain',
                  }}
                />
                <div
                  className={`controls ${
                    controlsVisible ? 'visible' : 'hidden'
                  }`}
                >
                  <button
                    className="control-btn"
                    onClick={() => {
                      if (videoRef.current.paused) videoRef.current.play();
                      else videoRef.current.pause();
                    }}
                  >
                    {videoRef.current?.paused ? '▶' : '❚❚'}
                  </button>

                  <input
                    type="range"
                    className="seek"
                    min={0}
                    max={duration || 0}
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                  />
                  <span className="time">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>

                  <input
                    type="range"
                    className="volume"
                    min={0}
                    max={1}
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            ) : (
              <ReactPlayer
                ref={playerRef}
                url={playingUrl}
                playing={playing}
                controls
                width="100%"
                height="auto"
                volume={volume}
                style={{ borderRadius: '12px' }}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                    },
                  },
                }}
                onProgress={({ playedSeconds }) => setProgress(playedSeconds)}
                onDuration={(d) => setDuration(d)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
