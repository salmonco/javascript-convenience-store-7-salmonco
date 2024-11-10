import throwError from '../util/throwError.js';

class BuyProductManager {
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
    if (quantity > generalProduct.getQuantity()) {
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

    generalProduct.setQuantity(generalProduct.getQuantity() - quantity);
  }

  buyWithPromotionProduct(promotionProduct, name, quantity) {
    this.#promotionBuyProducts = {
      ...this.#promotionBuyProducts,
      [name]: this.#promotionBuyProducts[name] + quantity || quantity,
    };

    promotionProduct.setQuantity(promotionProduct.getQuantity() - quantity);
  }

  addBonusProductQuantity(name, quantity) {
    this.#bonusProducts = {
      ...this.#bonusProducts,
      [name]: this.#bonusProducts[name] + quantity || quantity,
    };
  }

  isLessThanPromotionBuyQuantity(buyProduct, promotion) {
    return buyProduct.quantity < promotion.getBuy();
  }

  shouldPickMoreItem(buyProduct, promotion) {
    return buyProduct.quantity === promotion.getBuy();
  }

  static calculateMoreGetQuantity(products, promotions, buyProduct) {
    const prod = products.find((product) => product.getName() === buyProduct.name);
    const promotion = promotions.find((promo) => promo.getName() === prod.getPromotion());
    const moreGetQuantity = promotion.getBuy() + promotion.getGet() - buyProduct.quantity;

    return moreGetQuantity;
  }
}

export default BuyProductManager;
