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
import ReceiptCalculator from './controller/ReceiptCalculator.js';

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
    if (await this.handleMoreItems(buyProduct, promotionProduct, promotion)) return;

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

  async handleMoreItems(buyProduct, promotionProduct, promotion) {
    if (BuyProductManager.shouldPickMoreItem(buyProduct, promotion)) {
      await this.processPromotionProduct({ promotionProduct, buyProduct, promotion });

      return true;
    }
    return false;
  }

  async processGeneralProduct(generalProduct, buyProduct) {
    if (BuyProductManager.canBuyWithGeneralProduct(generalProduct, buyProduct.quantity)) {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);
    }
  }

  async processPromotionProduct({ promotionProduct, buyProduct, promotion }) {
    const answer = await this.getMorePromotionChoice(buyProduct);

    if (answer === 'Y') {
      this.handlePromotionProduct({ promotionProduct, buyProduct, promotion });
    }
  }

  getMorePromotionChoice(buyProduct) {
    return InputView.readGetMorePromotionChoice(
      this.#convenienceStore.getInventory().getProducts(),
      this.#convenienceStore.getPromotionManager().getPromotions(),
      buyProduct,
    );
  }

  handlePromotionProduct({ promotionProduct, buyProduct, promotion }) {
    const totalBuyProductQuantity = ReceiptCalculator.calculateTotalBuyProductQuantity(promotion, buyProduct);
    const moreGetQuantity = BuyProductManager.calculateMoreGetQuantity(
      this.#convenienceStore.getInventory().getProducts(),
      this.#convenienceStore.getPromotionManager().getPromotions(),
      buyProduct,
    );

    this.#buyProductManager.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalBuyProductQuantity);
    this.#buyProductManager.addBonusProductQuantity(buyProduct.name, moreGetQuantity);
  }

  async processPromotionResult(promotionProduct, generalProduct, buyProduct) {
    const { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity } =
      this.getPromotionResult(buyProduct);

    this.processPromotionPurchase(promotionProduct, buyProduct, totalPromotionQuantity, totalBonusQuantity);

    if (this.isPromotionStockSufficient(remainBuyProductQuantity)) return;

    await this.handleInsufficientPromotionStock(generalProduct, buyProduct, remainBuyProductQuantity);
  }

  getPromotionResult(buyProduct) {
    return this.#convenienceStore
      .getPromotionManager()
      .getPromotionResult(buyProduct, this.#convenienceStore.getInventory().getProducts());
  }

  processPromotionPurchase(promotionProduct, buyProduct, totalPromotionQuantity, totalBonusQuantity) {
    this.#buyProductManager.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalPromotionQuantity);
    this.#buyProductManager.addBonusProductQuantity(buyProduct.name, totalBonusQuantity);
  }

  isPromotionStockSufficient(remainBuyProductQuantity) {
    return remainBuyProductQuantity === 0;
  }

  async handleInsufficientPromotionStock(generalProduct, buyProduct, remainBuyProductQuantity) {
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
