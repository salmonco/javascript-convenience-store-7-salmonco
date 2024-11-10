class Inventory {
  #products = []; // [{ name, price, quantity, promotion }]

  setProducts(products) {
    this.#products = products;
  }

  getProducts() {
    return this.#products;
  }

  getProductByName(name) {
    const prods = this.#products.filter((product) => product.name === name);

    const promotionProduct = prods.find((prod) => prod.promotion !== 'null');
    const generalProduct = prods.find((prod) => prod.promotion === 'null');

    return { promotionProduct, generalProduct };
  }

  isLessThanPromotionQuantity(promotionProduct, promotion) {
    const unit = promotion.buy + promotion.get;

    if (promotionProduct.quantity < unit) {
      return false;
    }

    return true;
  }
}

export default Inventory;
