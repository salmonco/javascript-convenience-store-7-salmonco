import { DateTimes } from '@woowacourse/mission-utils';
import InputView from '../view/InputView.js';
import Promotion from '../model/Promotion.js';
import PromotionInputParser from '../InputParser/PromotionInputParser.js';

class PromotionManager {
  #promotions = []; // [new Promotion({ name, buy, get, startDate, endDate })]

  async initPromotions() {
    const promotionsData = await InputView.readPromotions();
    const promotions = PromotionInputParser.parsePromotions(promotionsData);

    const promotionPromises = promotions.map(async ({ name, buy, get, startDate, endDate }) => {
      const promotion = new Promotion({ name, buy, get, startDate, endDate });

      this.#promotions.push(promotion);
    });

    await Promise.all(promotionPromises);
  }

  getPromotions() {
    return this.#promotions;
  }

  getPromotionByName(name) {
    return this.#promotions.find((promotion) => promotion.getName() === name);
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

    if (now < promotion.getStartDate() || now > promotion.getEndDate()) {
      return false;
    }

    return true;
  }

  getPromotionResult(buyProduct, products) {
    const prod = products.find((product) => product.getName() === buyProduct.name);
    const promotion = this.#promotions.find((promo) => promo.getName() === prod.getPromotion());

    const unit = promotion.getBuy() + promotion.getGet();
    const possiblePromotionCount = this.getPossiblePromotionCount(buyProduct.quantity, prod.getQuantity(), unit);

    const totalPromotionQuantity = possiblePromotionCount * unit;
    const remainBuyProductQuantity = buyProduct.quantity - totalPromotionQuantity;
    const totalBonusQuantity = possiblePromotionCount * promotion.getGet();

    return { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity };
  }

  getPossiblePromotionCount(buyProductQuantity, prodQuantity, unit) {
    const possiblePromotionCountWithBuyProduct = Math.floor(buyProductQuantity / unit);
    const possiblePromotionCountWithInventory = Math.floor(prodQuantity / unit);

    return Math.min(possiblePromotionCountWithBuyProduct, possiblePromotionCountWithInventory);
  }
}

export default PromotionManager;
