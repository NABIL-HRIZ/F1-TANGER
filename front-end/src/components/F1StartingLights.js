import React, { useEffect, useState } from 'react';
import '../styles/F1StartingLights.css';

function F1StartingLights({ isLoading }) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 6);
    }, 400);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="f1-lights-container">
      <div className="lights-frame">
        <div className={`f1-light red ${animationPhase >= 1 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 2 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 3 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 4 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 5 ? 'active' : ''}`}></div>

        <div className={`f1-light red ${animationPhase >= 1 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 2 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 3 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 4 ? 'active' : ''}`}></div>
        <div className={`f1-light red ${animationPhase >= 5 ? 'active' : ''}`}></div>
      </div>


    </div>
  );
}

export default F1StartingLights;
