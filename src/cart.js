export class Cart {
    constructor(updateCallback) {
        this.items = [];
        this.total = 0;
        this.updateCallback = updateCallback;
    }

    addPrice(price) {
        const value = parseFloat(price);
        if (isNaN(value)) return;

        this.items.push({ id: Date.now(), price: value, qty: 1 });
        this.calculate();
    }

    updateQty(id, change) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) this.removeItem(id);
        }
        this.calculate();
    }

    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.calculate();
    }

    calculate() {
        this.total = this.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        this.updateCallback(this.items, this.total);
    }
}
