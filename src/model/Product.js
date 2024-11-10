class Product {
  #name;

  #price;

  #quantity;

  #promotion;

  constructor({ name, price, quantity, promotion }) {
    this.#name = name;
    this.#price = price;
    this.#quantity = quantity;
    this.#promotion = promotion;
  }

  getName() {
    return this.#name;
  }

  getPrice() {
    return this.#price;
  }

  getQuantity() {
    return this.#quantity;
  }

  setQuantity(quantity) {
    this.#quantity = quantity;
  }

  getPromotion() {
    return this.#promotion;
  }

  toString() {
    let quantityMessage = `${this.#quantity}개`;

    if (this.#quantity === 0) {
      quantityMessage = '재고 없음';
    }

    let promotionMessage = this.#promotion;
    if (this.#promotion === 'null') {
      promotionMessage = '';
    }

    return `- ${this.#name} ${this.#price.toLocaleString()}원 ${quantityMessage} ${promotionMessage}`;
  }
}

export default Product;
