import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./scanner.module.css";

const PriceScanner = ({ onDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processingRef = useRef(false);
  const intervalRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  // =========================
  // INIT CAMERA
  // =========================
  const initCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("El navegador no soporta acceso a cámara.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
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

      switch (err.name) {
        case "NotAllowedError":
          alert("Permiso de cámara denegado.");
          break;
        case "NotFoundError":
          alert("No se encontró cámara disponible.");
          break;
        default:
          alert("Error al iniciar la cámara.");
      }
    }
  }, []);

  // =========================
  // PROCESAR FRAME
  // =========================
  const processImage = useCallback(async () => {
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

      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob);

      const response = await fetch(
        "https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error backend");

      const data = await response.json();

      if (data.price) {
        const numeric = parseFloat(
          data.price.replace(",", ".")
        );

        if (!isNaN(numeric)) {
          setLastPrice(numeric);
          onDetected?.(numeric);

          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 250);
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      processingRef.current = false;
    }
  }, [onDetected]);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((t) => t.stop());
      }
      clearInterval(intervalRef.current);
    };
  }, [initCamera]);

  // =========================
  // CONTROL SCAN LOOP
  // =========================
  useEffect(() => {
    if (scanning) {
      intervalRef.current = setInterval(processImage, 2000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [scanning, processImage]);

  return (
    <div className={styles.container}>
      <div className={styles.cameraWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
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
          onClick={() => setScanning((prev) => !prev)}
        >
          {scanning ? "PAUSAR SCANNER" : "INICIAR SCANNER"}
        </button>

        {lastPrice !== null && (
          <div className={styles.result}>
            Último detectado:
            <strong> ${lastPrice.toFixed(2)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceScanner;