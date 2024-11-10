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
    // 상품 목록과 행사 목록을 파일 입출력을 통해 불러온다.
    await this.#convenienceStore.init();

    // 환영 인사와 함께 상품명, 가격, 프로모션 이름, 재고를 안내한다. 만약 재고가 0개라면 재고 없음을 출력한다.
    OutputView.printWelcome();
    OutputView.printProducts(this.#convenienceStore.getInventory().getProducts());

    // 구매할 상품명과 수량을 입력받는다.
    await this.processBuyProducts();

    // 멤버십 할인 적용 여부를 입력 받는다.
    await this.askForMembershipSale();

    // 영수증 출력
    this.printReceipt();

    // 추가 구매 여부를 입력 받는다.
    await this.askForAdditionalBuy();
  }

  async askForMembershipSale() {
    const answer = await InputView.readMembershipSaleChoice();
    this.#membership.setMembershipByAnswer(answer);
  }

  async processBuyProducts() {
    try {
      this.#buyProductManager.initBuyProducts();

      const buyString = await InputView.readItem();
      const buyProducts = this.parseBuyProducts(buyString);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const buyProduct of buyProducts) {
        await this.processBuyProduct(buyProduct);
      }
    } catch (error) {
      Console.print(`[ERROR] ${ERROR_MESSAGES.INVALID_INPUT}\n${error.message}`);
      await this.processBuyProducts(); // 재귀 호출로 다시 입력받기
    }
  }

  parseBuyProducts(buyString) {
    const buyList = splitWithComma(buyString);

    return BuyProductInputParser.splitWithHyphen(buyList);
  }

  async processBuyProduct(buyProduct) {
    const { promotionProduct, generalProduct } = this.#convenienceStore
      .getInventory()
      .getProductByName(buyProduct.name);

    if (!PromotionManager.canSaleWithPromotionProduct(promotionProduct)) {
      await this.processGeneralProduct(generalProduct, buyProduct);
      return;
    }

    const promotion = this.#convenienceStore.getPromotionManager().getPromotionByName(promotionProduct.getPromotion());

    if (!PromotionManager.isTodayPromotionDate(promotion)) {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);
      return;
    }

    if (BuyProductManager.isLessThanPromotionBuyQuantity(buyProduct, promotion)) {
      this.#buyProductManager.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);
      return;
    }

    if (BuyProductManager.shouldPickMoreItem(buyProduct, promotion)) {
      await this.processPromotionProduct(promotionProduct, generalProduct, buyProduct, promotion);
      return;
    }

    await this.processPromotionResult(promotionProduct, generalProduct, buyProduct);
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

  async askForAdditionalBuy() {
    const answer = await InputView.readAdditionalBuyChoice();

    if (answer === 'Y') {
      OutputView.printWelcome();
      OutputView.printProducts(this.#convenienceStore.getInventory().getProducts());
      await this.processBuyProducts();
      await this.askForMembershipSale();
      this.printReceipt();
      await this.askForAdditionalBuy();
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
