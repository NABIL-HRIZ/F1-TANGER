import React from 'react';
import '../styles/F1Loader.css';

function F1Loader() {
  return (
    <div className="f1-loader-container">
      <div className="f1-wheel">
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-center"></div>
      </div>
    </div>
  );
}

export default F1Loader;
