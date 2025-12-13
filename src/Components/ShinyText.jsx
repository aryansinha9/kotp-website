import React from 'react';

const ShinyText = ({ text, disabled = false, speed = 5, className = '' }) => {
    return (
        <>
            <style>{`
        @keyframes shinyTextShine {
          0% {
            background-position: 100%;
          }
          100% {
            background-position: -100%;
          }
        }
        .shiny-text-wrapper {
          color: #b5b5b5a4;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          display: inline-block;
          animation: shinyTextShine 3s linear infinite;
        }
        .shiny-text-wrapper.disabled {
          animation: none;
        }
      `}</style>
            <span className={`shiny-text-wrapper ${disabled ? 'disabled' : ''} ${className}`}>
                {text}
            </span>
        </>
    );
};

export default ShinyText;
