import { useEffect, useRef, useState } from "react";

export default function Scanner({ onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        videoRef.current.srcObject = stream;
      } catch (err) {
        setError("No se pudo acceder a la cámara");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Región del rectángulo (centrado)
      const rectWidth = vw * 0.6;
      const rectHeight = vh * 0.2;

      const x = (vw - rectWidth) / 2;
      const y = (vh - rectHeight) / 2;

      canvas.width = rectWidth;
      canvas.height = rectHeight;

      // Recorte directo del video
      ctx.drawImage(
        video,
        x, y, rectWidth, rectHeight,
        0, 0, rectWidth, rectHeight
      );

      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      const formData = new FormData();
      formData.append("image", blob, "price.jpg");

      const response = await fetch(
        "https://breezy-loise-reypeon-48ecd9ba.koyeb.app/api/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        onDetected(data.price);
      } else {
        setError("No se pudo detectar precio");
      }

    } catch (err) {
      setError("Error enviando imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", maxWidth: "400px" }}>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%" }}
      />

      {/* Rectángulo guía */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "20%",
          width: "60%",
          height: "20%",
          border: "3px solid red",
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button
        onClick={captureAndSend}
        disabled={loading}
        style={{ marginTop: "10px", padding: "10px 20px" }}
      >
        {loading ? "Detectando..." : "Detectar"}
      </button>
    </div>
  );
}