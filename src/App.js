import { Console } from '@woowacourse/mission-utils';
import InputView from './view/InputView.js';
import OutputView from './view/OutputView.js';
import Membership from './model/Membership.js';
import throwError from './util/throwError.js';
import ConvenienceStore from './model/ConvenienceStore.js';
import BuyProductManager from './controller/BuyProductManager.js';
import splitWithComma from './util/splitWithComma.js';
import BuyProductInputParser from './InputParser/BuyProductInputParser.js';
import PromotionManager from './controller/PromotionManager.js';
import { ERROR_MESSAGES } from './constant/message.js';

class App {
  #convenienceStore = new ConvenienceStore();

  #buyProductManager = new BuyProductManager();

  #membership = new Membership();

  async run() {
    await this.#convenienceStore.init();

    await this.#process();
  }

  async #process() {
    OutputView.printWelcome(this.#convenienceStore.getInventory().getProducts());

    await this.processBuyProducts();
    await this.askForMembershipSale();

    this.printReceipt();

    await this.askForAdditionalBuy();
  }

  async askForMembershipSale() {
    const answer = await InputView.readMembershipSaleChoice();
    this.#membership.setMembershipByAnswer(answer);
  }

  async askForAdditionalBuy() {
    const answer = await InputView.readAdditionalBuyChoice();

    if (answer === 'Y') {
      await this.#process();
    }
  }

  async processBuyProducts() {
    try {
      this.#buyProductManager.init();
      const buyProducts = await this.getBuyProducts();
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const buyProduct of buyProducts) {
        await this.processBuyProduct(buyProduct);
      }
    } catch (error) {
      Console.print(`[ERROR] ${ERROR_MESSAGES.INVALID_INPUT}\n${error.message}`);
      await this.processBuyProducts();
    }
  }

  async getBuyProducts() {
    const buyString = await InputView.readBuyProduct();

    return this.parseBuyProducts(buyString);
  }

  parseBuyProducts(buyString) {
    const buyList = splitWithComma(buyString);

    return BuyProductInputParser.splitWithHyphen(buyList);
  }

  async processBuyProduct(buyProduct) {
    const { promotionProduct, generalProduct } = this.#convenienceStore
      .getInventory()
      .getProductByName(buyProduct.name);
    if (await this.handleGeneralProduct(promotionProduct, generalProduct, buyProduct)) return;

    const promotion = this.#convenienceStore.getPromotionManager().getPromotionByName(promotionProduct.getPromotion());
    if (await this.handlePromotionDate(promotion, generalProduct, buyProduct)) return;
    if (await this.handlePromotionQuantity(buyProduct, promotion, generalProduct)) return;
    if (await this.handleMoreItems(buyProduct, promotionProduct, generalProduct, promotion)) return;

    await this.processPromotionResult(promotionProduct, generalProduct, buyProduct);
  }

  async handleGeneralProduct(promotionProduct, generalProduct, buyProduct) {
    if (!PromotionManager.canSaleWithPromotionProduct(promotionProduct)) {
      await this.processGeneralProduct(generalProduct, buyProduct);

      return true;
    }
    return false;
  }

  async handlePromotionDate(promotion, generalProduct, buyProduct) {
    if (!PromotionManager.isTodayPromotionDate(promotion)) {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);

      return true;
    }
    return false;
  }

  async handlePromotionQuantity(buyProduct, promotion, generalProduct) {
    if (BuyProductManager.isLessThanPromotionBuyQuantity(buyProduct, promotion)) {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);

      return true;
    }
    return false;
  }

  async handleMoreItems(buyProduct, promotionProduct, generalProduct, promotion) {
    if (BuyProductManager.shouldPickMoreItem(buyProduct, promotion)) {
      await this.processPromotionProduct(promotionProduct, generalProduct, buyProduct, promotion);

      return true;
    }
    return false;
  }

  async processGeneralProduct(generalProduct, buyProduct) {
    if (BuyProductManager.canBuyWithGeneralProduct(generalProduct, buyProduct.quantity)) {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);
    }
  }

  async processPromotionProduct(promotionProduct, generalProduct, buyProduct, promotion) {
    const answer = await InputView.readGetMorePromotionChoice(
      this.#convenienceStore.getInventory().getProducts(),
      this.#convenienceStore.getPromotionManager().getPromotions(),
      buyProduct,
    );

    if (answer === 'Y') {
      const totalBuyProductQuantity = promotion.getBuy() + promotion.getGet();
      const moreGetQuantity = totalBuyProductQuantity - buyProduct.quantity;

      this.#buyProductManager.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalBuyProductQuantity);
      this.#buyProductManager.addBonusProductQuantity(buyProduct.name, moreGetQuantity);
    }
  }

  async processPromotionResult(promotionProduct, generalProduct, buyProduct) {
    const { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity } = this.#convenienceStore
      .getPromotionManager()
      .getPromotionResult(buyProduct, this.#convenienceStore.getInventory().getProducts());

    this.#buyProductManager.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalPromotionQuantity);
    this.#buyProductManager.addBonusProductQuantity(buyProduct.name, totalBonusQuantity);

    if (remainBuyProductQuantity === 0) {
      return;
    }

    if (remainBuyProductQuantity > generalProduct.getQuantity()) {
      throwError(ERROR_MESSAGES.EXCEED_STOCK);
    }

    const answer = await InputView.readBuyConinueChoice(buyProduct.name, remainBuyProductQuantity);

    if (answer === 'Y') {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, remainBuyProductQuantity);
    }
  }

  printReceipt() {
    OutputView.printReceipt({
      promotionBuyProducts: this.#buyProductManager.getPromotionBuyProducts(),
      generalBuyProducts: this.#buyProductManager.getGeneralBuyProducts(),
      products: this.#convenienceStore.getInventory().getProducts(),
      bonusProducts: this.#buyProductManager.getBonusProducts(),
      isMembership: this.#membership.getMembership(),
    });
  }
}

export default App;
