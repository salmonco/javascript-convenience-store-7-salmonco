import { DateTimes } from '@woowacourse/mission-utils';

class Promotion {
  #promotions = []; // [{ name, buy, get, startDate, endDate }]

  setPromotions(promotions) {
    this.#promotions = promotions;
  }

  getPromotions() {
    return this.#promotions;
  }

  getPromotionByName(name) {
    return this.#promotions.find((promotion) => promotion.name === name);
  }

  canSaleWithPromotionProduct(promotionProduct) {
    if (promotionProduct === undefined) {
      return false;
    }

    return true;
  }

  isTodayPromotionDate(promotion) {
    // 오늘 날짜가 프로모션 기간 내에 포함되었는지 확인한다.
    const now = DateTimes.now().toISOString().split('T')[0];

    if (now < promotion.startDate || now > promotion.endDate) {
      return false;
    }

    return true;
  }

  getPromotionResult(buyProduct, products) {
    const prod = products.find((product) => product.name === buyProduct.name);
    const promotion = this.#promotions.find((promo) => promo.name === prod.promotion);

    const unit = promotion.buy + promotion.get;
    const possiblePromotionCountWithBuyProduct = Math.floor(buyProduct.quantity / unit);
    const possiblePromotionCountWithInventory = Math.floor(prod.quantity / unit);

    const possiblePromotionCount = Math.min(possiblePromotionCountWithBuyProduct, possiblePromotionCountWithInventory);
    const totalPromotionQuantity = possiblePromotionCount * unit;
    const remainBuyProductQuantity = buyProduct.quantity - totalPromotionQuantity;
    const totalBonusQuantity = possiblePromotionCount * promotion.get;

    return { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity };
  }
}

export default Promotion;
