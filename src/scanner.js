import Tesseract from 'tesseract.js';

export async function initCamera(videoElement) {
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
    });
    videoElement.srcObject = stream;
}

export async function processImage(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);

    // Solo buscamos números para que sea más rápido
    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    
    // Regex para encontrar precios (ej: 150.00 o 1200)
    const match = text.match(/\d+([.,]\d{2})?/);
    return match ? match[0].replace(',', '.') : null;
}