import InputView from './view/InputView.js';
import InputParser from './controller/InputParser.js';
import OutputView from './view/OutputView.js';
import Inventory from './model/Inventory.js';
import Promotion from './model/Promotion.js';
import BuyProduct from './model/BuyProduct.js';
import Membership from './model/Membership.js';
import throwError from './util/throwError.js';

class App {
  #inventory = new Inventory();

  #promotion = new Promotion();

  #buyProducts = new BuyProduct();

  #membership = new Membership();

  async run() {
    // 상품 목록과 행사 목록을 파일 입출력을 통해 불러온다.
    const productsData = await InputView.readProducts();
    const products = InputParser.parseProducts(productsData);
    this.#inventory.setProducts(products);

    const promotionsData = await InputView.readPromotions();
    const promotions = InputParser.parsePromotions(promotionsData);
    this.#promotion.setPromotions(promotions);

    // 환영 인사와 함께 상품명, 가격, 프로모션 이름, 재고를 안내한다. 만약 재고가 0개라면 재고 없음을 출력한다.
    OutputView.printWelcome();
    OutputView.printProducts(products);

    // 구매할 상품명과 수량을 입력받는다.
    const buyString = await InputView.readItem();

    // 개별 상품을 쉼표(,)로 파싱한다.
    const buyList = InputParser.splitWithComma(buyString);

    // 상품명과 수량을 하이픈(-)으로 파싱한다.
    const buyProducts = InputParser.splitWithHyphen(buyList);

    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const buyProduct of buyProducts) {
      const { promotionProduct, generalProduct } = this.#inventory.getProductByName(buyProduct.name);

      // 프로모션 적용 불가
      if (!this.#promotion.canSaleWithPromotionProduct(promotionProduct)) {
        // 일반 재고가 없는 경우 구매할 수 없다.
        if (this.#buyProducts.canBuyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity)) {
          this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, buyProduct.quantity);
        }

        continue;
      }

      const promotion = this.#promotion.getPromotionByName(promotionProduct.promotion);

      if (!this.#promotion.isTodayPromotionDate(promotion)) {
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
          this.#inventory.getProducts(),
          this.#promotion.getPromotions(),
          buyProduct,
        );

        if (answer === 'Y') {
          // Y: 증정 받을 수 있는 상품을 추가한다.
          const totalBuyProductQuantity = promotion.buy + promotion.get;
          const moreGetQuantity = totalBuyProductQuantity - buyProduct.quantity;

          this.#buyProducts.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalBuyProductQuantity);

          this.#buyProducts.addBonusProductQuantity(buyProduct.name, moreGetQuantity);
        }

        continue;
      }

      const { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity } =
        this.#promotion.getPromotionResult(buyProduct);

      this.#buyProducts.buyWithPromotionProduct(promotionProduct, buyProduct.name, totalPromotionQuantity);
      this.#buyProducts.addBonusProductQuantity(buyProduct.name, totalBonusQuantity);

      if (remainBuyProductQuantity === 0) {
        // 프로모션 재고 충분
        continue;
      }

      // 프로모션 재고 부족 -> 이거 정가로 구매할 거야?
      // 일반 재고가 없는 경우 구매할 수 없다.
      if (remainBuyProductQuantity > generalProduct.quantity) {
        throwError(`재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.`);

        continue;
      }

      // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는지 확인한다.
      const answer = await InputView.readBuyConinueChoice(buyProduct.name, remainBuyProductQuantity);

      if (answer === 'Y') {
        // Y: 일부 수량에 대해 정가로 결제한다.
        this.#buyProducts.buyWithGeneralProduct(generalProduct, buyProduct.name, remainBuyProductQuantity);
      }
    }

    // 멤버십 할인 적용 여부를 입력 받는다.
    const answer = await InputView.readMembershipSaleChoice();

    this.#membership.setMembershipByAnswer(answer);

    OutputView.printReceipt({
      promotionBuyProducts: this.#buyProducts.getPromotionBuyProducts(),
      generalBuyProducts: this.#buyProducts.getGeneralBuyProducts(),
      products: this.#inventory.getProducts(),
      bonusProducts: this.#buyProducts.getBonusProducts(),
      isMembership: this.#membership.getMembership(),
    });
  }
}

export default App;
