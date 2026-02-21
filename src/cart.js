export class Cart {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
        // Cargar del localStorage al iniciar
        const saved = localStorage.getItem('scanner_cart');
        this.items = saved ? JSON.parse(saved) : [];
        this.calculate();
    }

    addPrice(price) {
        const value = parseFloat(price);
        if (isNaN(value)) return;

        const newItem = { 
            id: Date.now(), 
            price: value, 
            qty: 1, 
            image: null // Aquí guardaremos la foto después
        };
        
        this.items.push(newItem);
        this.saveAndRender();
        return newItem.id; // Devolvemos el ID para saber a cuál ponerle la foto
    }

    updateImage(id, imageData) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.image = imageData;
            this.saveAndRender();
        }
    }

    updateQty(id, change) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) this.items = this.items.filter(i => i.id !== id);
        }
        this.saveAndRender();
    }

    clear() {
        this.items = [];
        this.saveAndRender();
    }

    saveAndRender() {
        localStorage.setItem('scanner_cart', JSON.stringify(this.items));
        this.calculate();
    }

    calculate() {
        const total = this.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        this.updateCallback(this.items, total);
    }
}