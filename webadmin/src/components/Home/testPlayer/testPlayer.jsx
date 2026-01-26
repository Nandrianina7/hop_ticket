import React from "react";
import YouTube from "react-youtube";

export default function TestPlayer() {
  // Video ID: example from YouTube
  const videoId = "FBuQsHSgmi0";

  // Player options (YouTube IFrame API)
  const opts = {
    height: "480",
    width: "853",
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
    },
  };

  const onReady = (event) => {
    // Access the player instance if you want
    console.log("YouTube Player Ready ✅");
    // You can even control playback:
    // event.target.playVideo();
  };

  const onError = (error) => {
    console.error("YouTube Player Error ❌", error);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#121212",
      }}
    >
      <h2 style={{ color: "white" }}>🎥 YouTube Player Test</h2>

      <YouTube videoId={videoId} opts={opts} onReady={onReady} onError={onError} />

      <p style={{ color: "#aaa", marginTop: "10px" }}>
        If you see the video and can play it, your YouTube embedding works fine ✅
      </p>
    </div>
  );
}
