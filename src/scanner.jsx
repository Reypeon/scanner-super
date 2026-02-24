import { useEffect, useRef, useState } from "react";

export default function Scanner({ onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Iniciar cámara
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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

      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

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
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "400px" }}
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