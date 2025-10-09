import React from "react";
import Lottie from "lottie-react";
import theme from "../theme";
import fitnessAnimation from "../Fitness.json";
import jumpingAnimation from "../Jumping Lottie Animation.json";
import pikbalBallAnimation from "../Pikbal Ball.json";

const LoadingScreen = ({ type = "default", message = "Loading..." }) => {
  // Define different loading animations based on type
  const getLoadingContent = () => {
    switch (type) {
      case "courts":
        return {
          animation: (
            <Lottie
              animationData={pikbalBallAnimation}
              style={{
                width: "160px",
                height: "160px",
                margin: "0 auto",
              }}
            />
          ),
          message: "Loading courts...",
          subtitle: "Preparing your sports facilities",
        };

      case "gym":
        return {
          animation: (
            <Lottie
              animationData={fitnessAnimation}
              style={{
                width: "160px",
                height: "160px",
                margin: "0 auto",
              }}
            />
          ),
          message: "Loading gym schedule...",
          subtitle: "Preparing your workout sessions",
        };

      case "events":
        return {
          animation: (
            <Lottie
              animationData={jumpingAnimation}
              style={{
                width: "160px",
                height: "160px",
                margin: "0 auto",
              }}
            />
          ),
          message: "Loading events...",
          subtitle: "Preparing your events",
        };

      default:
        return {
          animation: (
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          ),
          message: message,
          icon: "⏳",
          subtitle: "Please wait...",
        };
    }
  };

  const content = getLoadingContent();

  return (
    <>
      {/* Simplified CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          padding: theme?.spacing?.[8] || "2rem",
          color: theme?.colors?.text?.secondary || "#4b5563",
          animation: "fadeInUp 0.6s ease-out",
        }}
      >
        {/* Animation Container */}
        <div 
          style={{ 
            marginBottom: theme?.spacing?.[4] || "1rem",
            padding: theme?.spacing?.[3] || "0.75rem",
            background: theme?.colors?.background?.paper || "#ffffff",
            borderRadius: "20px",
            boxShadow: theme?.shadows?.lg || "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {content.animation}
        </div>

        {/* Content */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              fontSize: theme?.typography?.fontSize?.["2xl"] || "1.5rem",
              fontWeight: theme?.typography?.fontWeight?.semibold || 600,
              color: theme?.colors?.text?.primary || "#111827",
              marginBottom: theme?.spacing?.[2] || "0.5rem",
            }}
          >
            {content.message}
          </div>
          
          {content.subtitle && (
            <div
              style={{
                fontSize: theme?.typography?.fontSize?.base || "1rem",
                color: theme?.colors?.text?.secondary || "#4b5563",
                opacity: 0.8,
                marginBottom: theme?.spacing?.[4] || "1rem",
              }}
            >
              {content.subtitle}
            </div>
          )}
          
          {/* Loading dots animation */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: theme?.spacing?.[1] || "0.25rem",
              marginTop: theme?.spacing?.[3] || "0.75rem",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: theme?.colors?.primary?.main || "#667eea",
                  borderRadius: "50%",
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;