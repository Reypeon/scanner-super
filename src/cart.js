export class Cart {
  constructor(updateCallback) {
    const saved = localStorage.getItem("scanner_cart");
    this.items = saved ? JSON.parse(saved) : [];
    this.updateCallback = updateCallback;
    this.calculate();
  }

  addPrice(price, image = null) {
    const value = parseFloat(price);
    if (isNaN(value)) return null;

    const newItem = {
      id: Date.now(),
      price: value,
      qty: 1,
      image,
    };

    this.items.push(newItem);
    this.save();

    return newItem.id;
  }

  updateQty(id, change) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
      this.items = this.items.filter((i) => i.id !== id);
    }

    this.save();
  }

  setImage(id, imageData) {
    const item = this.items.find((i) => i.id === id);
    if (item) item.image = imageData;
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  save() {
    localStorage.setItem("scanner_cart", JSON.stringify(this.items));
    this.calculate();
  }

  calculate() {
    const total = this.items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    this.updateCallback(this.items, total);
  }
}