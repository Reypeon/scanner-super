/**
 * Módulo de escaneo de precios mediante OCR (Tesseract.js)
 */
import Tesseract from 'tesseract.js';

/**
 * Inicializa la cámara del dispositivo y la vincula a un elemento de video.
 * @param {HTMLVideoElement} videoElement - El elemento del DOM donde se mostrará la cámara.
 */
export async function initCamera(videoElement) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Fuerza la cámara trasera en móviles
                width: { ideal: 1280 },    // Resolución ideal para lectura de texto
                height: { ideal: 720 }
            }, 
            audio: false 
        });
        videoElement.srcObject = stream;
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de dar permisos HTTPS.");
    }
}

/**
 * Captura un frame del video, procesa la imagen y extrae el precio detectado.
 * @param {HTMLVideoElement} videoElement - El video desde donde capturar la imagen.
 * @returns {Promise<string|null>} El precio detectado como string o null si no hubo éxito.
 */
export async function processImage(videoElement) {
    // 1. Crear un lienzo (canvas) interno para capturar el frame actual
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // 2. Dibujar el frame del video en el canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);

    try {
        // 3. Ejecutar el motor de OCR Tesseract sobre el canvas
        // Usamos 'eng' ya que los números son universales en este idioma
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
        
        /**
         * 4. Filtrar el texto con una Expresión Regular (Regex)
         * \d+          : Busca uno o más números
         * ([.,]\d{2})? : Busca opcionalmente un separador (. o ,) seguido de 2 decimales
         */
        const match = text.match(/\d+([.,]\d{2})?/);
        
        if (match) {
            // Normalizar el formato: reemplaza comas por puntos para que JS lo entienda como número
            return match[0].replace(',', '.');
        }
        
        return null;
    } catch (error) {
        console.error("Error en el procesamiento OCR:", error);
        return null;
    }
}