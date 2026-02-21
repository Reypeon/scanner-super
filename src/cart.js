export class Cart {
    constructor(updateCallback) {
        // Cargar datos guardados al iniciar
        const saved = localStorage.getItem('scanner_cart');
        this.items = saved ? JSON.parse(saved) : [];
        this.updateCallback = updateCallback;
        this.calculate();
    }

    addPrice(price) {
        const value = parseFloat(price);
        if (isNaN(value)) return;
        this.items.push({ id: Date.now(), price: value, qty: 1, image: null });
        this.save();
    }

    updateQty(id, change) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) this.items = this.items.filter(i => i.id !== id);
        }
        this.save();
    }

    // Nueva función para guardar la foto del producto específico
    setImage(id, imageData) {
        const item = this.items.find(i => i.id === id);
        if (item) item.image = imageData;
        this.save();
    }

    clear() {
        this.items = [];
        this.save();
    }

    save() {
        localStorage.setItem('scanner_cart', JSON.stringify(this.items));
        this.calculate();
    }

    calculate() {
        const total = this.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        this.updateCallback(this.items, total);
    }
}