import fs from 'fs/promises';
import { Console } from '@woowacourse/mission-utils';
import BuyProductManager from '../controller/BuyProductManager.js';
import { INPUT_MESSAGES } from '../constant/message.js';

const InputView = {
  async readProducts() {
    try {
      const data = await fs.readFile('public/products.md', 'utf8');
      return data;
    } catch (error) {
      this.throwError(`products.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
      return null;
    }
  },

  async readPromotions() {
    try {
      const data = await fs.readFile('public/promotions.md', 'utf8');
      return data;
    } catch (error) {
      this.throwError(`promotions.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
      return null;
    }
  },

  readBuyProduct() {
    return Console.readLineAsync(INPUT_MESSAGES.BUY_PRODUCT);
  },

  readGetMorePromotionChoice(products, promotions, buyProduct) {
    const moreGetQuantity = BuyProductManager.calculateMoreGetQuantity(products, promotions, buyProduct);

    return Console.readLineAsync(INPUT_MESSAGES.ADD_PROMOTION(buyProduct, moreGetQuantity));
  },

  readMembershipSaleChoice() {
    return Console.readLineAsync(INPUT_MESSAGES.MEMBERSHIP_SALE);
  },

  readBuyConinueChoice(productName, remainBuyProductQuantity) {
    return Console.readLineAsync(INPUT_MESSAGES.PROMOTION_NOT_APPLIED(productName, remainBuyProductQuantity));
  },

  readAdditionalBuyChoice() {
    return Console.readLineAsync(INPUT_MESSAGES.ADDITIONAL_PURCHASE);
  },
};

export default InputView;
