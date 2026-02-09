import React, { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import useStore from "./store";

export default function HandTracker() {
  const videoRef = useRef(null);
  const setFingerCount = useStore((state) => state.setFingerCount);

  useEffect(() => {
    let handLandmarker;
    let animationFrameId;

    const setupMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU", // Uses your integrated graphics for speed
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      startWebcam();
    };

    const startWebcam = () => {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      });
    };

    const predictWebcam = () => {
      if (videoRef.current && handLandmarker) {
        const startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          countFingers(landmarks);
        }
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };

    // The Logic: Is the tip of the finger higher than the knuckle?
    // Note: In webcam video, Y coordinates go DOWN (0 is top, 1 is bottom).
    // So "Higher" means a smaller Y value.
    const countFingers = (landmarks) => {
      const tips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky tips
      const dips = [6, 10, 14, 18]; // Knuckles/Joints
      
      let count = 0;
      
      // Check Thumb (different logic needed usually, but keeping it simple)
      if (landmarks[4].x < landmarks[3].x) count++; 

      // Check other 4 fingers
      for (let i = 0; i < 4; i++) {
        if (landmarks[tips[i]].y < landmarks[dips[i]].y) {
          count++;
        }
      }
      
      // Send the count to the "Brain"
      setFingerCount(count);
    };

    setupMediaPipe();

    return () => cancelAnimationFrame(animationFrameId);
  }, [setFingerCount]);

  // Hide the video because we only want to see the particles
  return <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />;
}