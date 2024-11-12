import InputView from '../view/InputView.js';
import Product from '../model/Product.js';
import ProductInputParser from '../InputParser/ProductInputParser.js';

class Inventory {
  #products = []; // [new Product({ name, price, quantity, promotion })]

  async init() {
    const productsData = await InputView.readProducts();
    const products = ProductInputParser.parseProducts(productsData);

    const productPromises = products.map(async ({ name, price, quantity, promotion }) => {
      const product = new Product({ name, price, quantity, promotion });

      this.#products.push(product);
    });

    await Promise.all(productPromises);
  }

  getProducts() {
    return this.#products;
  }

  getProductByName(name) {
    const promotionProduct = this.#products.find(
      (product) => product.getName() === name && product.getPromotion() !== 'null',
    );
    const generalProduct = this.#products.find(
      (product) => product.getName() === name && product.getPromotion() === 'null',
    );

    return { promotionProduct, generalProduct };
  }
}

export default Inventory;
