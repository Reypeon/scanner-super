// import { useEffect, useRef, useState } from "react";

// export default function Scanner({ onDetected }) {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });

//         videoRef.current.srcObject = stream;
//       } catch (err) {
//         setError("No se pudo acceder a la cámara");
//       }
//     };

//     startCamera();

//     return () => {
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   const captureAndSend = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       const vw = video.videoWidth;
//       const vh = video.videoHeight;

//       // Región del rectángulo (centrado)
//       const rectWidth = vw * 0.6;
//       const rectHeight = vh * 0.2;

//       const x = (vw - rectWidth) / 2;
//       const y = (vh - rectHeight) / 2;

//       canvas.width = rectWidth;
//       canvas.height = rectHeight;

//       // Recorte directo del video
//       ctx.drawImage(
//         video,
//         x, y, rectWidth, rectHeight,
//         0, 0, rectWidth, rectHeight
//       );

//       const blob = await new Promise(resolve =>
//         canvas.toBlob(resolve, "image/jpeg", 0.9)
//       );

//       const formData = new FormData();
//       formData.append("image", blob, "price.jpg");

//       const response = await fetch(
//         "https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();

//       if (data.status === "success") {
//         onDetected(data.price);
//       } else {
//         setError("No se pudo detectar precio");
//       }

//     } catch (err) {
//       setError("Error enviando imagen");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ position: "relative", maxWidth: "400px" }}>
      
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         style={{ width: "100%" }}
//       />

//       {/* Rectángulo guía */}
//       <div
//         style={{
//           position: "absolute",
//           top: "40%",
//           left: "20%",
//           width: "60%",
//           height: "20%",
//           border: "3px solid red",
//           boxSizing: "border-box",
//           pointerEvents: "none",
//         }}
//       />

//       <canvas ref={canvasRef} style={{ display: "none" }} />

//       <button
//         onClick={captureAndSend}
//         disabled={loading}
//         style={{ marginTop: "10px", padding: "10px 20px" }}
//       >
//         {loading ? "Detectando..." : "Detectar"}
//       </button>
//     </div>
//   );
// }

import React, { useRef, useState, useEffect } from 'react';
import styles from './scanner.module.css';

const Scanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedNumber, setScannedNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Iniciar cámara
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accediendo a la cámara:", err);
      }
    }
    startCamera();
  }, []);

  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsScanning(true);

    // Configurar dimensiones del recorte (ejemplo: centro de la imagen)
    const ctx = canvas.getContext('2d');
    const cropWidth = 300; 
    const cropHeight = 150;
    const startX = (video.videoWidth - cropWidth) / 2;
    const startY = (video.videoHeight - cropHeight) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Dibujar solo la parte "recortada" en el canvas
    ctx.drawImage(
      video, 
      startX, startY, cropWidth, cropHeight, // Fuente (recorte)
      0, 0, cropWidth, cropHeight           // Destino (canvas)
    );

    // Convertir a Blob y enviar
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');

      try {
        const response = await fetch('https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        // Asumiendo que el server devuelve { number: "123" }
        setScannedNumber(data.price);
      } catch (error) {
        console.error("Error al procesar imagen:", error);
      } finally {
        setIsScanning(false);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <video ref={videoRef} autoPlay playsInline className={styles.video} />
        {/* Guía visual para el usuario */}
        <div className={styles.overlay}>
          <div className={styles.guideBox}></div>
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          onClick={captureAndSend} 
          className={styles.scanBtn}
          disabled={isScanning}
        >
          {isScanning ? 'Escaneando...' : 'Escanear Número'}
        </button>

        <div className={styles.inputGroup}>
          <label>Número detectado:</label>
          <input 
            type="text" 
            value={scannedNumber} 
            onChange={(e) => setScannedNumber(e.target.value)}
            placeholder="Esperando escaneo..."
            className={styles.input}
          />
        </div>
      </div>

      {/* Canvas oculto para procesamiento */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Scanner;