import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [playingUrl, setPlayingUrl] = useState('');
  const [isFile, setIsFile] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  const handlePlay = () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const isDirectFile = /\.(mp4|webm|ogg|m4v|avi|mov|mkv)$/i.test(url);
      setPlayingUrl(url);
      setIsFile(isDirectFile);
      setPlaying(true);
    } catch {
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
    } else if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
    setTimeout(() => {
      setPlayingUrl('');
      setUrl('');
      setIsFile(false);
    }, 200);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await videoRef.current.requestPictureInPicture();
    } catch (e) {
      console.error('PiP error:', e);
    }
  };

  const handleRewind = () => {
    if (isFile && videoRef.current) videoRef.current.currentTime -= 5;
    else playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 5);
  };

  const handleForward = () => {
    if (isFile && videoRef.current) videoRef.current.currentTime += 5;
    else playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 5);
  };

  const togglePlayPause = () => {
    if (isFile && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    } else setPlaying((prev) => !prev);
  };

  const handleProgress = (e) => {
    if (isFile) {
      const p = (e.target.currentTime / e.target.duration) * 100;
      setProgress(p);
    }
  };

  const handleDuration = (e) => {
    if (isFile) setDuration(e.target.duration);
  };

  const handleSeek = (clientX) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
    const newTime = percent * (isFile ? duration : playerRef.current.getDuration());

    setProgress(percent * 100);
    if (isFile && videoRef.current) videoRef.current.currentTime = newTime;
    else playerRef.current.seekTo(newTime);
  };

  const handleMouseDown = (e) => {
    handleSeek(e.clientX);
    const handleMove = (ev) => handleSeek(ev.clientX);
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playingUrl) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          handleForward();
          break;
        case 'ArrowLeft':
          handleRewind();
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

  return (
    <div className="app">
      <div className="player-container" ref={containerRef}>
        <h1 className="title">Custom Video Player</h1>

        <input
          type="text"
          placeholder="Paste a YouTube or direct video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="buttons">
          <button onClick={handlePlay}>▶ Play</button>
          <button onClick={handleStop}>■ Stop</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {playingUrl && (
          <div className="video-box">
            {isFile ? (
              <video
                ref={videoRef}
                src={playingUrl}
                autoPlay
                preload="auto"
                onTimeUpdate={handleProgress}
                onDurationChange={handleDuration}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                style={{ width: '100%', borderRadius: '12px', objectFit: 'contain' }}
              />
            ) : (
              <ReactPlayer
                ref={playerRef}
                url={playingUrl}
                playing={playing}
                width="100%"
                height="auto"
                controls={false}
                onProgress={(p) => setProgress(p.played * 100)}
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
              />
            )}

            {/* ==== CUSTOM PLAYER BAR ==== */}
            <div className="custom-controls">
              <button onClick={handleRewind}>⏪</button>
              <button onClick={togglePlayPause}>{playing ? '⏸' : '▶'}</button>
              <button onClick={handleForward}>⏩</button>
              <button onClick={toggleFullscreen}>⛶</button>
              {isFile && <button onClick={togglePiP}>📺</button>}

              <div
                className="progress-bar"
                ref={progressBarRef}
                onMouseDown={handleMouseDown}
              >
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
