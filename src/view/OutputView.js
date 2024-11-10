import { Console } from '@woowacourse/mission-utils';

const OutputView = {
  printWelcome() {
    Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
  },
  printProducts(products) {
    products.forEach((product) => {
      Console.print(product.toString());
    });
  },
  printReceipt({ promotionBuyProducts, generalBuyProducts, products, bonusProducts, isMembership }) {
    const totalBuyProducts = {};
    let totalBuyProductQuantity = 0;
    let generalBuyProductsTotalPrice = 0;

    Object.entries(generalBuyProducts).forEach(([name, quantity]) => {
      const prod = products.find((product) => product.getName() === name);
      const price = prod.getPrice();

      generalBuyProductsTotalPrice += price * quantity;
      totalBuyProducts[name] = totalBuyProducts[name] + quantity || quantity;
      totalBuyProductQuantity += quantity;
    });

    Object.entries(promotionBuyProducts).forEach(([name, quantity]) => {
      totalBuyProducts[name] = totalBuyProducts[name] + quantity || quantity;
      totalBuyProductQuantity += quantity;
    });

    let totalBuyPrice = 0;
    let promotionSalePrice = 0;

    // 구매 상품 내역, 증정 상품 내역, 금액 정보를 영수증 형식으로 출력한다.
    Console.print('\n==============W 편의점================\n');
    Console.print('상품명		수량	금액\n');
    Object.entries(totalBuyProducts).forEach(([name, quantity]) => {
      const prod = products.find((product) => product.getName() === name);
      const price = prod.getPrice();
      const totalPrice = price * quantity;

      Console.print(`${name}		${quantity}	${totalPrice.toLocaleString()}\n`);

      totalBuyPrice += totalPrice;
    });

    Console.print('=============증	정===============\n');
    Object.entries(bonusProducts).forEach(([name, quantity]) => {
      const prod = products.find((product) => product.getName() === name);
      const price = prod.getPrice();

      Console.print(`${name}		${quantity}\n`);

      promotionSalePrice += quantity * price;
    });

    Console.print('====================================\n');
    Console.print(`총구매액		${totalBuyProductQuantity}	${totalBuyPrice.toLocaleString()}\n`);
    Console.print(`행사할인			-${promotionSalePrice.toLocaleString()}`);

    let membershipSalePrice = 0;

    if (isMembership) {
      membershipSalePrice = generalBuyProductsTotalPrice * 0.3;

      if (membershipSalePrice > 8000) {
        membershipSalePrice = 8000;
      }
    }

    Console.print(`멤버십할인			-${membershipSalePrice.toLocaleString()}\n`);

    const totalPrice = totalBuyPrice - promotionSalePrice - membershipSalePrice;
    Console.print(`내실돈			 ${totalPrice.toLocaleString()}\n`);
  },
};

export default OutputView;
