import { Console, DateTimes } from '@woowacourse/mission-utils';
import InputView from './view/InputView.js';
import InputParser from './controller/InputParser.js';
import OutputView from './view/OutputView.js';

class App {
  products = []; // [{ name, price, quantity, promotion }]

  promotions = []; // [{ name, buy, get, startDate, endDate }]

  promotionBuyProducts = {}; // { 상픔명: 수량 }

  generalBuyProducts = {}; // { 상픔명: 수량 }

  bonusProducts = {}; // { 상픔명: 수량 }

  isMembership; // boolean

  async run() {
    // 상품 목록과 행사 목록을 파일 입출력을 통해 불러온다.
    const productsData = await InputView.readProducts();
    const products = InputParser.parseProducts(productsData);
    this.products = products;

    const promotionsData = await InputView.readPromotions();
    const promotions = InputParser.parsePromotions(promotionsData);
    this.promotions = promotions;

    // 환영 인사와 함께 상품명, 가격, 프로모션 이름, 재고를 안내한다. 만약 재고가 0개라면 재고 없음을 출력한다.
    OutputView.printWelcome();
    OutputView.printProducts(products);

    // 구매할 상품명과 수량을 입력받는다.
    const buyString = await Console.readLineAsync(
      '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
    );

    // 개별 상품을 쉼표(,)로 파싱한다.
    const buyList = buyString.split(',');

    // 상품명과 수량을 하이픈(-)으로 파싱한다.
    const buyProducts = buyList.map((buy) => {
      const [name, quantity] = buy.slice(1, -1).split('-');

      return { name, quantity: Number(quantity) };
    });

    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const buyProduct of buyProducts) {
      console.log('promotionBuyProducts: ', this.promotionBuyProducts);
      console.log('generalBuyProducts: ', this.generalBuyProducts);
      console.log('bonusProducts: ', this.bonusProducts);
      console.log('products: ', this.products);

      const prods = this.products.filter((product) => product.name === buyProduct.name);
      const promotionProd = prods.find((prod) => prod.promotion !== 'null');
      const generalProd = prods.find((prod) => prod.promotion === 'null');

      // 프로모션 적용 불가
      if (promotionProd === undefined) {
        // 일반 재고가 없는 경우 구매할 수 없다.
        if (buyProduct.quantity > generalProd.quantity) {
          this.throwError(`재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.`);
        }

        this.generalBuyProducts = {
          ...this.generalBuyProducts,
          [buyProduct.name]: this.generalBuyProducts[buyProduct.name] + buyProduct.quantity || buyProduct.quantity,
        };

        // 일반 재고로 구매
        generalProd.quantity -= buyProduct.quantity;
        continue;
      }

      const promotion = this.promotions.find((promo) => promo.name === promotionProd.promotion);

      // 오늘 날짜가 프로모션 기간 내에 포함되었는지 확인한다.
      const now = DateTimes.now().toISOString().split('T')[0];
      if (now < promotion.startDate || now > promotion.endDate) {
        // 프로모션 기간이 아닌 경우 정가로 구매
        this.generalBuyProducts = {
          ...this.generalBuyProducts,
          [buyProduct.name]: this.generalBuyProducts[buyProduct.name] + buyProduct.quantity || buyProduct.quantity,
        };

        generalProd.quantity -= buyProduct.quantity;
        continue;
      }

      if (buyProduct.quantity < promotion.buy) {
        // 프로모션 buy 수량보다 적게 가져왔을 경우 더 가져올 건지 묻지는 않는다.
        // 일반 재고로 구매
        this.generalBuyProducts = {
          ...this.generalBuyProducts,
          [buyProduct.name]: this.generalBuyProducts[buyProduct.name] + buyProduct.quantity || buyProduct.quantity,
        };

        generalProd.quantity -= buyProduct.quantity;
      } else if (this.isLessBuyThanPromotion(buyProduct)) {
        // 1개 더 가져올랬는데 재고 부족하면? 정가로 사야 함 -> processPromotion
        // 프로모션 buy 수량만큼 가져왔음에도 get 수량보다 적게 가져왔을 경우 더 가져올 건지 묻는다.
        const answer = await this.readGetMorePromotionChoice(buyProduct);

        if (answer === 'Y') {
          // Y: 증정 받을 수 있는 상품을 추가한다.
          const totalBuyProductQuantity = promotion.buy + promotion.get;
          const moreGetQuantity = totalBuyProductQuantity - buyProduct.quantity;

          this.promotionBuyProducts = {
            ...this.promotionBuyProducts,
            [buyProduct.name]:
              this.promotionBuyProducts[buyProduct.name] + totalBuyProductQuantity || totalBuyProductQuantity,
          };

          this.bonusProducts = {
            ...this.bonusProducts,
            [buyProduct.name]: this.bonusProducts[buyProduct.name] + moreGetQuantity || moreGetQuantity,
          };

          promotionProd.quantity -= totalBuyProductQuantity;
        }
      } else {
        await this.processPromotion(promotionProd, generalProd, buyProduct);
      }
    }

    console.log('promotionBuyProducts: ', this.promotionBuyProducts);
    console.log('generalBuyProducts: ', this.generalBuyProducts);
    console.log('bonusProducts: ', this.bonusProducts);
    console.log('products: ', this.products);

    // 멤버십 할인 적용 여부를 입력 받는다.
    const answer = await Console.readLineAsync('\n멤버십 할인을 받으시겠습니까? (Y/N)\n');

    if (answer === 'Y') {
      this.isMembership = true;
    } else {
      this.isMembership = false;
    }

    const totalBuyProducts = {};
    let totalBuyProductQuantity = 0;
    let generalBuyProductsTotalPrice = 0;
    Object.entries(this.generalBuyProducts).forEach(([name, quantity]) => {
      const { price } = this.products.find((product) => product.name === name);

      generalBuyProductsTotalPrice += price * quantity;
      totalBuyProducts[name] = totalBuyProducts[name] + quantity || quantity;
      totalBuyProductQuantity += quantity;
    });

    Object.entries(this.promotionBuyProducts).forEach(([name, quantity]) => {
      totalBuyProducts[name] = totalBuyProducts[name] + quantity || quantity;
      totalBuyProductQuantity += quantity;
    });

    let totalBuyPrice = 0;
    let promotionSalePrice = 0;
    // 구매 상품 내역, 증정 상품 내역, 금액 정보를 영수증 형식으로 출력한다.
    Console.print('\n==============W 편의점================\n');
    Console.print('상품명		수량	금액\n');
    Object.entries(totalBuyProducts).forEach(([name, quantity]) => {
      const { price } = this.products.find((product) => product.name === name);
      const totalPrice = price * quantity;

      Console.print(`${name}		${quantity}	${totalPrice.toLocaleString()}\n`);

      totalBuyPrice += totalPrice;
    });

    Console.print('=============증	정===============\n');
    Object.entries(this.bonusProducts).forEach(([name, quantity]) => {
      const { price } = this.products.find((product) => product.name === name);

      Console.print(`${name}		${quantity}\n`);

      promotionSalePrice += quantity * price;
    });

    Console.print('====================================\n');
    Console.print(`총구매액		${totalBuyProductQuantity}	${totalBuyPrice.toLocaleString()}\n`);
    Console.print(`행사할인			-${promotionSalePrice.toLocaleString()}`);

    let membershipSalePrice = 0;

    if (this.isMembership) {
      membershipSalePrice = generalBuyProductsTotalPrice * 0.3;

      if (membershipSalePrice > 8000) {
        membershipSalePrice = 8000;
      }
    }

    Console.print(`멤버십할인			-${membershipSalePrice.toLocaleString()}\n`);

    const totalPrice = totalBuyPrice - promotionSalePrice - membershipSalePrice;
    Console.print(`내실돈			 ${totalPrice.toLocaleString()}\n`);
  }

  throwError(message) {
    throw new Error(`[ERROR] ${message}`);
  }

  getPromotionResult(buyProduct) {
    const prod = this.products.find((product) => product.name === buyProduct.name);
    const promotion = this.promotions.find((promo) => promo.name === prod.promotion);

    const unit = promotion.buy + promotion.get;
    const possiblePromotionCountWithBuyProduct = Math.floor(buyProduct.quantity / unit);
    const possiblePromotionCountWithInventory = Math.floor(prod.quantity / unit);

    const possiblePromotionCount = Math.min(possiblePromotionCountWithBuyProduct, possiblePromotionCountWithInventory);
    const totalPromotionQuantity = possiblePromotionCount * unit;
    const remainBuyProductQuantity = buyProduct.quantity - totalPromotionQuantity;
    const totalBonusQuantity = possiblePromotionCount * promotion.get;

    return { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity };
  }

  isLessBuyThanPromotion(buyProduct) {
    const prod = this.products.find((product) => product.name === buyProduct.name);
    const promotion = this.promotions.find((promo) => promo.name === prod.promotion);

    const unit = promotion.buy + promotion.get;

    if (prod.quantity < unit) {
      // 재고 부족하면 정가로 사야 함
      return false;
    }

    return buyProduct.quantity === promotion.buy;
  }

  readGetMorePromotionChoice(buyProduct) {
    const prod = this.products.find((product) => product.name === buyProduct.name);
    const promotion = this.promotions.find((promo) => promo.name === prod.promotion);
    const moreGetQuantity = promotion.buy + promotion.get - buyProduct.quantity;

    return Console.readLineAsync(
      `현재 ${buyProduct.name}은(는) ${moreGetQuantity}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
    );
  }

  readBuyConinueChoice(productName, remainBuyQuantity) {
    return Console.readLineAsync(
      `\n현재 ${productName} ${remainBuyQuantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
    );
  }

  async processPromotion(promotionProd, generalProd, buyProduct) {
    // 콜라 2+1 프로모션 7개 남음
    // 콜라 10개 구매 -> 2개 이상으로 가져왔네 -> get 수량 더하면 3개 -> 재고 7개보다 작거나 같음 -> 프로모션 적용, 재고 4개
    // 콜라 7개 구매 -> 2개 이상으로 가져왔네 -> get 수량 더하면 3개 -> 재고 4개보다 작거나 같음 -> 프로모션 적용, 재고 1개
    // 콜라 4개 구매 -> 2개 이상으로 가져왔네 -> get 수량 더하면 3개 -> 재고 1개보다 큼 -> 프로모션 미적용, 그래도 구매할래?
    const { remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity } =
      this.getPromotionResult(buyProduct);
    console.log(remainBuyProductQuantity, totalPromotionQuantity, totalBonusQuantity);

    this.promotionBuyProducts = {
      ...this.promotionBuyProducts,
      [buyProduct.name]: this.promotionBuyProducts[buyProduct.name] + totalPromotionQuantity || totalPromotionQuantity,
    };

    this.bonusProducts = {
      ...this.bonusProducts,
      [buyProduct.name]: this.bonusProducts[buyProduct.name] + totalBonusQuantity || totalBonusQuantity,
    };

    promotionProd.quantity -= totalPromotionQuantity;

    if (remainBuyProductQuantity === 0) {
      // 프로모션 재고 충분
    } else {
      // 프로모션 재고 부족 -> 이거 정가로 구매할 거야?
      // 일반 재고가 없는 경우 구매할 수 없다.
      if (remainBuyProductQuantity > generalProd.quantity) {
        this.throwError(`재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.`);

        return;
      }

      // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는지 확인한다.
      const answer = await this.readBuyConinueChoice(buyProduct.name, remainBuyProductQuantity);

      if (answer === 'Y') {
        // Y: 일부 수량에 대해 정가로 결제한다.
        this.generalBuyProducts = {
          ...this.generalBuyProducts,
          [buyProduct.name]:
            this.generalBuyProducts[buyProduct.name] + remainBuyProductQuantity || remainBuyProductQuantity,
        };

        generalProd.quantity -= remainBuyProductQuantity;
      } else {
        // N: 정가로 결제해야하는 수량만큼 제외한 후 결제를 진행한다.
      }
    }
  }
}

export default App;
