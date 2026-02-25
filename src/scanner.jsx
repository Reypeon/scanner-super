import React, { useRef, useState, useEffect } from "react";
import styles from "./scanner.module.css";

const Scanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [scannedNumber, setScannedNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              resolve();
            };
          });
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo acceder a la cámara");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== 4) {
      setError("La cámara no está lista");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const ctx = canvas.getContext("2d");

      // 🔥 NUEVO CÁLCULO PRECISO BASADO EN EL TAMAÑO VISUAL REAL
      const rect = video.getBoundingClientRect();

      const displayWidth = rect.width;
      const displayHeight = rect.height;

      const scaleX = video.videoWidth / displayWidth;
      const scaleY = video.videoHeight / displayHeight;

      // mismas proporciones que el guideBox en CSS
      const boxWidth = displayWidth * 0.6;
      const boxHeight = displayHeight * 0.2;

      const boxX = (displayWidth - boxWidth) / 2;
      const boxY = (displayHeight - boxHeight) / 2;

      const startX = boxX * scaleX;
      const startY = boxY * scaleY;
      const cropWidth = boxWidth * scaleX;
      const cropHeight = boxHeight * scaleY;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        video,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) throw new Error("No se pudo generar la imagen");

      const formData = new FormData();
      formData.append("image", blob, "scan.jpg");

      const response = await fetch(
        "https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Error en el servidor");
      }

      const data = await response.json();

      if (data.status === "success" && data.price) {
        setScannedNumber(data.price);
      } else {
        setError(data.message || "No se detectó precio");
      }
    } catch (err) {
      console.error(err);
      setError("Error procesando la imagen");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
        />

        <div className={styles.overlay}>
          <div className={styles.guideBox} />
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={captureAndSend}
          disabled={isScanning}
          className={styles.scanBtn}
        >
          {isScanning ? "Escaneando..." : "Escanear Precio"}
        </button>

        <div className={styles.inputGroup}>
          <label>Precio detectado:</label>
          <input
            type="text"
            value={scannedNumber}
            onChange={(e) => setScannedNumber(e.target.value)}
            placeholder="Esperando escaneo..."
            className={styles.input}
          />
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Scanner;