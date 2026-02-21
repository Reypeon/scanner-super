import './style.css';
import { Cart } from './src/cart';
import { initCamera, processImage } from './src/scanner';

const video = document.querySelector('#video');
const btnCapture = document.querySelector('#btn-capture');
const totalEl = document.querySelector('#total');
const listEl = document.querySelector('#list');

// Función para capturar una miniatura del video
const takeSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100; // Miniatura pequeña para no saturar el storage
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    // Recortamos el centro del video para el cuadradito
    ctx.drawImage(video, (video.videoWidth/2)-50, (video.videoHeight/2)-50, 100, 100, 0, 0, 100, 100);
    return canvas.toDataURL('image/jpeg', 0.7);
};

const myCart = new Cart((items, total) => {
    totalEl.innerText = `$${total.toFixed(2)}`;
    listEl.innerHTML = items.map(item => `
        <div class="item">
            <div class="product-img">
                ${item.image ? `<img src="${item.image}" />` : `<div class="placeholder"></div>`}
            </div>
            <div class="item-info">
                <span>$${item.price.toFixed(2)}</span>
                <div class="qty-controls">
                    <button onclick="window.changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="window.changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).reverse().join(''); // Reverse para que el último scaneado salga arriba
});

window.changeQty = (id, delta) => myCart.updateQty(id, delta);

btnCapture.addEventListener('click', async () => {
    btnCapture.innerText = "LEYENDO...";
    btnCapture.disabled = true;

    const price = await processImage(video);
    
    if (price) {
        const newId = myCart.addPrice(price);
        // Capturamos la foto inmediatamente después de detectar el precio
        const photo = takeSnapshot();
        myCart.updateImage(newId, photo);
    } else {
        alert("No se detectó el precio. Intenta acercarte más.");
    }

    btnCapture.innerText = "CAPTURAR PRECIO";
    btnCapture.disabled = false;
});

initCamera(video);