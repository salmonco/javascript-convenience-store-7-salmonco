import { Console } from '@woowacourse/mission-utils';

const OutputView = {
  printWelcome() {
    Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
  },
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
  },
};

export default OutputView;
