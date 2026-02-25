import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./scanner.module.css";

const AUTO_SCAN_INTERVAL = 500; // ms
const JPEG_QUALITY = 0.85; // equilibrio velocidad / calidad
const AUTO_MODE = false; // cambiar a true si quieres escaneo continuo
const DEBUG_PREVIEW = false; // true para ver el recorte

const Scanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const scanningRef = useRef(false);

  const [scannedNumber, setScannedNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     INICIAR CÁMARA
  ========================= */
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

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;

          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play();
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /* =========================
     CAPTURA PRECISA
  ========================= */
  const captureAndSend = useCallback(async () => {
    if (scanningRef.current) return; // evita concurrencia

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== 4) {
      setError("La cámara no está lista");
      return;
    }

    scanningRef.current = true;
    setIsScanning(true);
    setError(null);

    try {
      const ctx = canvas.getContext("2d");

      // 🔥 MAPEO EXACTO DISPLAY → VIDEO REAL
      const rect = video.getBoundingClientRect();

      const displayWidth = rect.width;
      const displayHeight = rect.height;

      const scaleX = video.videoWidth / displayWidth;
      const scaleY = video.videoHeight / displayHeight;

      // proporciones del guideBox (60% ancho, 20% alto)
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

      // Preview debug opcional
      if (DEBUG_PREVIEW && previewCanvasRef.current) {
        const previewCtx = previewCanvasRef.current.getContext("2d");
        previewCanvasRef.current.width = cropWidth;
        previewCanvasRef.current.height = cropHeight;
        previewCtx.drawImage(canvas, 0, 0);
      }

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
      );

      if (!blob) throw new Error("No se pudo generar imagen");

      const formData = new FormData();
      formData.append("image", blob, "scan.jpg");

      const response = await fetch(
        "https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) throw new Error("Error en servidor OCR");

      const data = await response.json();

      if (data.status === "success" && data.price) {
        setScannedNumber(data.price);
      } else {
        setError(data.message || "No se detectó precio");
      }
    } catch (err) {
      console.error(err);
      setError("Error procesando imagen");
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
    }
  }, []);

  /* =========================
     AUTO SCAN (opcional)
  ========================= */
  useEffect(() => {
    if (AUTO_MODE) {
      intervalRef.current = setInterval(() => {
        captureAndSend();
      }, AUTO_SCAN_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [captureAndSend]);

  /* =========================
     RENDER
  ========================= */
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
        {!AUTO_MODE && (
          <button
            onClick={captureAndSend}
            disabled={isScanning}
            className={styles.scanBtn}
          >
            {isScanning ? "Escaneando..." : "Escanear Precio"}
          </button>
        )}

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

      {DEBUG_PREVIEW && (
        <canvas
          ref={previewCanvasRef}
          style={{ marginTop: 10, maxWidth: "100%" }}
        />
      )}
    </div>
  );
};

export default Scanner;