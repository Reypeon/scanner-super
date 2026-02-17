import './style.css';
import { Cart } from './src/cart';
import { initCamera, processImage } from './src/scanner';

const video = document.querySelector('#video');
const btnCapture = document.querySelector('#btn-capture');
const totalEl = document.querySelector('#total');
const listEl = document.querySelector('#list');

// Inicializar carrito con función de dibujado
const myCart = new Cart((items, total) => {
    totalEl.innerText = `$${total.toFixed(2)}`;
    listEl.innerHTML = items.map(item => `
        <div class="item">
            <span>$${item.price} (x${item.qty})</span>
            <button onclick="window.changeQty(${item.id}, 1)">+</button>
            <button onclick="window.changeQty(${item.id}, -1)">-</button>
        </div>
    `).join('');
});

// Funciones globales para los botones
window.changeQty = (id, delta) => myCart.updateQty(id, delta);

// Botón de captura
btnCapture.addEventListener('click', async () => {
    btnCapture.innerText = "Leyendo...";
    const price = await processImage(video);
    if (price) myCart.addPrice(price);
    else alert("No se detectó el precio");
    btnCapture.innerText = "CAPTURAR PRECIO";
});

initCamera(video);