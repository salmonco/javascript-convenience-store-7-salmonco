import throwError from '../util/throwError.js';

class BuyProduct {
  #promotionBuyProducts = {}; // { 상픔명: 수량 }

  #generalBuyProducts = {}; // { 상픔명: 수량 }

  #bonusProducts = {}; // { 상픔명: 수량 }

  getPromotionBuyProducts() {
    return this.#promotionBuyProducts;
  }

  getGeneralBuyProducts() {
    return this.#generalBuyProducts;
  }

  getBonusProducts() {
    return this.#bonusProducts;
  }

  canBuyWithGeneralProduct(generalProduct, quantity) {
    // 일반 재고가 없는 경우 구매할 수 없다.
    if (quantity > generalProduct.quantity) {
      throwError(`재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.`);

      return false;
    }

    return true;
  }

  buyWithGeneralProduct(generalProduct, name, quantity) {
    this.#generalBuyProducts = {
      ...this.#generalBuyProducts,
      [name]: this.#generalBuyProducts[name] + quantity || quantity,
    };

    generalProduct.quantity -= quantity;
  }

  buyWithPromotionProduct(promotionProduct, name, quantity) {
    this.#promotionBuyProducts = {
      ...this.#promotionBuyProducts,
      [name]: this.#promotionBuyProducts[name] + quantity || quantity,
    };

    promotionProduct.quantity -= quantity;
  }

  addBonusProductQuantity(name, quantity) {
    this.#bonusProducts = {
      ...this.#bonusProducts,
      [name]: this.#bonusProducts[name] + quantity || quantity,
    };
  }

  isLessThanPromotionBuyQuantity(buyProduct, promotion) {
    return buyProduct.quantity < promotion.buy;
  }

  shouldPickMoreItem(buyProduct, promotion) {
    return buyProduct.quantity === promotion.buy;
  }
}

export default BuyProduct;
