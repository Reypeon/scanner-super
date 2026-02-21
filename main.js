import './style.css';
import { Cart } from './src/cart';
import { initCamera, processImage } from './src/scanner';

const video = document.querySelector('#video');
const totalEl = document.querySelector('#total');
const listEl = document.querySelector('#list');
const scanOverlay = document.querySelector('.scan-overlay');

const myCart = new Cart((items, total) => {
    totalEl.innerText = `$${total.toFixed(2)}`;
    listEl.innerHTML = items.map(item => `
        <div class="item">
            <div class="product-photo-sector">
                <div class="img-box">
                    ${item.image ? `<img src="${item.image}" />` : `<div class="empty-img"></div>`}
                </div>
                <button class="btn-snap" onclick="window.snapPhoto(${item.id})">📸</button>
            </div>
            <div class="item-details">
                <span class="price">$${item.price.toFixed(2)}</span>
                <div class="qty-wrapper">
                    <button onclick="window.changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="window.changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).reverse().join('');
});

// Exponer funciones a la ventana global
window.changeQty = (id, delta) => myCart.updateQty(id, delta);

window.snapPhoto = (id) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    // Captura lo que ve la cámara en ese instante
    ctx.drawImage(video, (video.videoWidth/2)-100, (video.videoHeight/2)-100, 200, 200, 0, 0, 200, 200);
    myCart.setImage(id, canvas.toDataURL('image/jpeg', 0.8));
};

// Lógica de Escaneo al tocar el video
video.addEventListener('click', async () => {
    scanOverlay.classList.add('scanning');
    const price = await processImage(video);
    scanOverlay.classList.remove('scanning');
    
    if (price) {
        myCart.addPrice(price);
    } else {
        alert("Precio no detectado");
    }
});

initCamera(video);