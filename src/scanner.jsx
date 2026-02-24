import { useEffect, useRef, useState } from "react";
import styles from "./scanner.module.css";

const PriceScanner = ({ onDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processingRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  // =========================
  // INIT CAMERA
  // =========================
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);
      }
    } catch (err) {
      console.error("Error acceso cámara:", err);
      alert("No se pudo acceder a la cámara.");
    }
  };

  // =========================
  // ENVIAR FRAME AL BACKEND
  // =========================
  const processImage = async () => {
    if (!videoRef.current || processingRef.current) return;

    processingRef.current = true;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.8)
      );

      const formData = new FormData();
      formData.append("image", blob);

      const response = await fetch(
        "https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.price) {
        const numeric = parseFloat(
          data.price.replace(",", ".")
        );

        if (!isNaN(numeric)) {
          setLastPrice(numeric);
          onDetected(numeric);

          // Flash visual
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 300);
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      processingRef.current = false;
    }
  };

  useEffect(() => {
    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (scanning) {
      interval = setInterval(processImage, 2000);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className={styles.container}>
      <div className={styles.cameraWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={styles.video}
        />

        <div
          className={`${styles.scanBox} ${
            showFlash ? styles.flashActive : ""
          }`}
        />
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className={styles.controls}>
        <button
          className={`${styles.button} ${
            scanning ? styles.active : ""
          }`}
          disabled={!isReady}
          onClick={() => setScanning(!scanning)}
        >
          {scanning ? "PAUSAR SCANNER" : "INICIAR SCANNER"}
        </button>

        {lastPrice && (
          <div className={styles.result}>
            Último detectado:
            <strong> ${lastPrice.toFixed(2)}</strong>
            <h1>{lastPrice}</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceScanner;