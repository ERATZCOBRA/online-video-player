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
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const handlePlay = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const parsed = new URL(url);
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
      containerRef.current.requestFullscreen().catch((err) => console.error('Fullscreen error:', err));
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playingUrl) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isFile && videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
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
              <video
                ref={videoRef}
                src={playingUrl}
                controls
                autoPlay
                preload="auto"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <ReactPlayer
                ref={playerRef}
                url={playingUrl}
                playing={playing}
                controls
                width="100%"
                height="auto"
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
