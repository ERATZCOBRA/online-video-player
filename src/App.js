// App.js
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './App.css';
@@ -22,16 +21,10 @@ function App() {

try {
const parsed = new URL(url);
      let finalUrl = url;
      const isDirectFile = /\.(mp4|webm|ogg|m4v|avi|mov|mkv)$/i.test(url);

      if (/bunkr/.test(parsed.hostname)) {
        const encoded = encodeURIComponent(url.trim());
        finalUrl = `http://localhost:4000/proxy?url=${encoded}`;
      }

      const isDirectFile = /\.(mp4|webm|ogg|m4v|avi|mov|mkv)$/i.test(finalUrl);
      setPlayingUrl(finalUrl);
      setIsFile(isDirectFile || /bunkr|localhost:4000/.test(finalUrl));
      setPlayingUrl(url);
      setIsFile(isDirectFile);
setPlaying(true);
} catch (e) {
setError('Invalid URL');
@@ -121,7 +114,7 @@ function App() {

<input
type="text"
          placeholder="Paste a YouTube, Bunkr, or direct video URL..."
          placeholder="Paste a YouTube or direct video URL..."
value={url}
onChange={(e) => setUrl(e.target.value)}
/>
