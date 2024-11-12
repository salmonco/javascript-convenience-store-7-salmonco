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

  #getQuantityMessage() {
    if (this.#quantity === 0) {
      return '재고 없음';
    }

    return `${this.#quantity}개`;
  }

  #getPromotionMessage() {
    if (this.#promotion === 'null') {
      return '';
    }

    return this.#promotion;
  }

  toString() {
    const quantityMessage = this.#getQuantityMessage();
    const promotionMessage = this.#getPromotionMessage();

    return `- ${this.#name} ${this.#price.toLocaleString()}원 ${quantityMessage} ${promotionMessage}`;
  }
}

export default Product;
