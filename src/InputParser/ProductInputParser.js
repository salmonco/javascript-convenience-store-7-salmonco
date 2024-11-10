import parseLineWithCallback from '../util/parseLineWithCallback.js';
import splitWithComma from '../util/splitWithComma.js';

const ProductInputParser = {
  parseProducts(data) {
    const products = parseLineWithCallback(data, this.parseProductLine);
    const onlyPromotionProducts = this.identifyPromotionProducts(products);
    this.addGeneralProducts(products, onlyPromotionProducts);

    return products;
  },
  parseProductLine(line) {
    const [name, price, quantity, promotion] = splitWithComma(line);

    return { name, promotion, price: Number(price), quantity: Number(quantity) };
  },
  identifyPromotionProducts(products) {
    const onlyPromotionProducts = {};

    products.forEach((product) => {
      onlyPromotionProducts[product.name] = product.promotion !== 'null';
    });

    return onlyPromotionProducts;
  },
  addGeneralProducts(products, onlyPromotionProducts) {
    Object.entries(onlyPromotionProducts).forEach(([name, isPromotionOnly]) => {
      if (!isPromotionOnly) return;

      this.addGeneralProduct(products, name);
    });
  },
  addGeneralProduct(products, name) {
    const { price } = products.find((prod) => prod.name === name);
    const promotionIdx = products.findIndex((prod) => prod.name === name);

    this.insertGeneralProduct(products, name, price, promotionIdx);
  },
  insertGeneralProduct(products, name, price, promotionIdx) {
    products.splice(promotionIdx, 0, {
      name,
      price,
      quantity: 0,
      promotion: 'null',
    });
  },
};

export default ProductInputParser;
