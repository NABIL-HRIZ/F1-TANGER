import React, { useEffect, useRef } from 'react';
import '../styles/VideoBackground.css';

function VideoBackground({ videoSource, shouldPlay = true }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && shouldPlay) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        videoRef.current?.play().catch((error) => {
          console.log('Video autoplay prevented:', error);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [shouldPlay]);

  return (
    <video
      ref={videoRef}
      className="video-background"
      loop
      muted
      playsInline
      preload="auto"
    >
      <source src={videoSource} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export default VideoBackground;
