import { Console } from '@woowacourse/mission-utils';
import InputView from './view/InputView.js';
import InputParser from './controller/InputParser.js';
import OutputView from './view/OutputView.js';
import BuyProduct from './model/BuyProduct.js';
import Membership from './model/Membership.js';
import throwError from './util/throwError.js';
import ConvenienceStore from './model/ConvenienceStore.js';

class App {
  #convenienceStore = new ConvenienceStore();

  #buyProducts = new BuyProduct();

  #membership = new Membership();

  async run() {
    // 상품 목록과 행사 목록을 파일 입출력을 통해 불러온다.
    await this.#convenienceStore.init();

    // 환영 인사와 함께 상품명, 가격, 프로모션 이름, 재고를 안내한다. 만약 재고가 0개라면 재고 없음을 출력한다.
    OutputView.printWelcome();
    OutputView.printProducts(this.#convenienceStore.getInventory().getProducts());

    // 구매할 상품명과 수량을 입력받는다.
    await this.processBuyItems();

    // 멤버십 할인 적용 여부를 입력 받는다.
    const answer = await InputView.readMembershipSaleChoice();

    this.#membership.setMembershipByAnswer(answer);

    OutputView.printReceipt({
      promotionBuyProducts: this.#buyProducts.getPromotionBuyProducts(),
      generalBuyProducts: this.#buyProducts.getGeneralBuyProducts(),
      products: this.#convenienceStore.getInventory().getProducts(),
      bonusProducts: this.#buyProducts.getBonusProducts(),
      isMembership: this.#membership.getMembership(),
    });
  }

  async processBuyItems() {
    try {
      const buyString = await InputView.readItem();

      // 개별 상품을 쉼표(,)로 파싱한다.
      const buyList = InputParser.splitWithComma(buyString);

      // 상품명과 수량을 하이픈(-)으로 파싱한다.
      const buyProducts = InputParser.splitWithHyphen(buyList);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const buyProduct of buyProducts) {
        const { promotionProduct, generalProduct } = this.#convenienceStore
          .getInventory()
          .getProductByName(buyProduct.name);

        // 프로모션 적용 불가
        if (!this.#convenienceStore.getPromotionManager().canSaleWithPromotionProduct(promotionProduct)) {
          // 일반 재고가 없는 경우 구매할 수 없다.
          if (this.#buyProducts.canBuyWithGeneralProduct(generalProduct, buyProduct.quantity)) {
            this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);

            continue;
          }
        }

        const promotion = this.#convenienceStore
          .getPromotionManager()
          .getPromotionByName(promotionProduct.getPromotion());

        if (!this.#convenienceStore.getPromotionManager().isTodayPromotionDate(promotion)) {
          // 프로모션 기간이 아닌 경우 정가로 구매
          this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);

          continue;
        }

        if (this.#buyProducts.isLessThanPromotionBuyQuantity(buyProduct, promotion)) {
          // 프로모션 buy 수량보다 적게 가져왔을 경우 더 가져올 건지 묻지는 않는다.
          // 일반 재고로 구매
          this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);

          continue;
        }

        if (this.#buyProducts.isLessThanPromotionBuyQuantity(buyProduct, promotion)) {
          this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);

          continue;
        }

        if (this.#buyProducts.shouldPickMoreItem(buyProduct, promotion)) {
          // 1개 더 가져올랬는데 재고 부족하면? 정가로 사야 함 -> processPromotion
          // 프로모션 buy 수량만큼 가져왔음에도 get 수량보다 적게 가져왔을 경우 더 가져올 건지 묻는다.
          const answer = await InputView.readGetMorePromotionChoice(
            this.#convenienceStore.getInventory().getProducts(),
            this.#convenienceStore.getPromotionManager().getPromotions(),
            buyProduct,
          );

          if (answer === 'Y') {
            // Y: 증정 받을 수 있는 상품을 추가한다.
            const totalBuyProductQuantity = promotion.getBuy() + promotion.getGet();
            const moreGetQuantity = totalBuyProductQuantity - buyProduct.quantity;

            this.#buyProducts.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalBuyProductQuantity);
            this.#buyProducts.addBonusProductQuantity(buyProduct.name, moreGetQuantity);
          }

          continue;
        }

        const { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity } = this.#convenienceStore
          .getPromotionManager()
          .getPromotionResult(buyProduct, this.#convenienceStore.getInventory().getProducts());

        this.#buyProducts.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalPromotionQuantity);
        this.#buyProducts.addBonusProductQuantity(buyProduct.name, totalBonusQuantity);

        if (remainBuyProductQuantity === 0) {
          // 프로모션 재고 충분
          continue;
        }

        // 프로모션 재고 부족 -> 이거 정가로 구매할 거야?
        // 일반 재고가 없는 경우 구매할 수 없다.
        if (remainBuyProductQuantity > generalProduct.getQuantity()) {
          throwError(`재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.`);
        }

        // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는지 확인한다.
        const answer = await InputView.readBuyConinueChoice(buyProduct.name, remainBuyProductQuantity);

        if (answer === 'Y') {
          // Y: 일부 수량에 대해 정가로 결제한다.
          this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, remainBuyProductQuantity);
        }
      }
    } catch (error) {
      Console.print(error.message);
      await this.processBuyItems(); // 재귀 호출로 다시 입력받기
    }
  }
}

export default App;
