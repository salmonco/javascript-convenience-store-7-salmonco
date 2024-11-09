import { Console } from '@woowacourse/mission-utils';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class App {
  async run() {
    // 상품 목록과 행사 목록을 파일 입출력을 통해 불러온다.
    const products = [];
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    const filePath = path.join(dirname, '..', 'public', 'products.md');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      data
        .split('\n')
        .slice(1, -1)
        .forEach((line) => {
          const [name, price, quantity, promotion] = line.split(',');

          products.push({ name, promotion, price: Number(price), quantity: Number(quantity) });
        });
    } catch (error) {
      this.throwError(`products.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
    }

    const promotions = [];
    const promotionFilePath = path.join(dirname, '..', 'public', 'promotions.md');
    try {
      const data = await fs.readFile(promotionFilePath, 'utf8');
      data
        .split('\n')
        .slice(1, -1)
        .forEach((line) => {
          const [name, buy, get, startDate, endDate] = line.split(',');

          promotions.push({ name, startDate, endDate, buy: Number(buy), get: Number(get) });
        });
    } catch (error) {
      this.throwError(`promotions.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
    }

    // 환영 인사와 함께 상품명, 가격, 프로모션 이름, 재고를 안내한다. 만약 재고가 0개라면 재고 없음을 출력한다.
    Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
    this.printProducts(products);

    // 구매할 상품명과 수량을 입력받는다.
    const buyString = await Console.readLineAsync(
      '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
    );

    // 개별 상품을 쉼표(,)로 파싱한다.
    const buyList = buyString.split(',');

    // 상품명과 수량을 하이픈(-)으로 파싱한다.
    const buyProducts = buyList.map((buy) => {
      const [name, quantity] = buy.slice(1, -1).split('-');

      return { name, quantity };
    });

    // 프로모션 적용이 가능한 상품인지 확인한다.
    buyProducts.forEach((buyProduct) => {
      if (this.isProtomotionAvailable(promotions, products, buyProduct.name)) {
        console.log(buyProduct.name);
        if (this.isIgnorePromotion(promotions, products, buyProduct)) {
          // 프로모션 buy 수량보다 적게 가져왔을 경우 더 가져올 건지 묻지는 않는다.
          console.log('ignore');
        } else if (this.isLessBuyThanPromotion(promotions, products, buyProduct)) {
          // 프로모션 buy 수량만큼 가져왔음에도 get 수량보다 적게 가져왔을 경우 더 가져올 건지 묻는다.
          // 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져왔는지 확인한다.
          // 수량보다 적게 가져왔을 경우, 혜택에 대한 안내 메시지를 출력한다.
          this.printGetMorePromotionMessage(promotions, products, buyProduct);
        }
        // 콜라 2+1 프로모션 7개 남음
        // 콜라 10개 구매 -> 2개 이상으로 가져왔네 -> get 수량 더하면 3개 -> 재고 7개보다 작거나 같음 -> 프로모션 적용, 재고 4개
        // 콜라 7개 구매 -> 2개 이상으로 가져왔네 -> get 수량 더하면 3개 -> 재고 4개보다 작거나 같음 -> 프로모션 적용, 재고 1개
        // 콜라 4개 구매 -> 2개 이상으로 가져왔네 -> get 수량 더하면 3개 -> 재고 1개보다 큼 -> 프로모션 미적용, 그래도 구매할래?
      }
    });

    // 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져왔는지 확인한다.
  }

  throwError(message) {
    throw new Error(`[ERROR] ${message}`);
  }

  printProducts(products) {
    products.forEach((product) => {
      const { name, price, quantity, promotion } = product;

      let quantityMessage = `${quantity}개`;

      if (quantity === 0) {
        quantityMessage = '재고 없음';
      }

      let promotionMessage = promotion;
      if (promotion === 'null') {
        promotionMessage = '';
      }

      Console.print(`- ${name} ${price.toLocaleString()}원 ${quantityMessage} ${promotionMessage}`);
    });
  }

  isProtomotionAvailable(promotions, products, productName) {
    const prod = products.find((product) => product.name === productName);

    return promotions.some((promotion) => promotion.name === prod.promotion);
  }

  isIgnorePromotion(promotions, products, buyProduct) {
    const prod = products.find((product) => product.name === buyProduct.name);
    const promotion = promotions.find((promo) => promo.name === prod.promotion);

    return buyProduct.quantity < promotion.buy;
  }

  isPromotionQuantityEnough(promotions, products, buyProduct) {
    const prod = products.find((product) => product.name === buyProduct.name);
    const promotion = promotions.find((promo) => promo.name === prod.promotion);

    const totalBuyQuantity = promotion.buy + promotion.get;

    return totalBuyQuantity <= prod.quantity;
  }

  isLessBuyThanPromotion(promotions, products, buyProduct) {
    const prod = products.find((product) => product.name === buyProduct.name);
    const promotion = promotions.find((promo) => promo.name === prod.promotion);

    const totalBuyQuantity = promotion.buy + promotion.get;

    return buyProduct.quantity < totalBuyQuantity;
  }

  printGetMorePromotionMessage(promotions, products, buyProduct) {
    const prod = products.find((product) => product.name === buyProduct.name);
    const promotion = promotions.find((promo) => promo.name === prod.promotion);

    Console.print(
      `현재 ${buyProduct.name}은(는) ${promotion.get}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
    );
  }
}

export default App;
