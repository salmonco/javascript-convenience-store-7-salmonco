import { Console } from '@woowacourse/mission-utils';
import ReceiptCalculator from '../controller/ReceiptCalculator.js';

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
    const { totalBuyProducts, ...footerData } = ReceiptCalculator.calculate({
      generalBuyProducts,
      promotionBuyProducts,
      bonusProducts,
      products,
      isMembership,
    });

    this.printHeader();
    this.printBody(totalBuyProducts, products, bonusProducts);
    this.printFooter(footerData);
  },

  printHeader() {
    Console.print('\n==============W 편의점================\n');
  },

  printBody(totalBuyProducts, products, bonusProducts) {
    this.printPerProduct(totalBuyProducts, products);
    this.printBonusProducts(bonusProducts);
  },

  printPerProduct(totalBuyProducts, products) {
    Console.print('상품명		수량	금액\n');
    Object.entries(totalBuyProducts).forEach(([name, quantity]) => {
      const totalPricePerProduct = ReceiptCalculator.calculateTotalPricePerProduct(products, name, quantity);

      Console.print(`${name}		${quantity}	${totalPricePerProduct.toLocaleString()}\n`);
    });
  },

  printBonusProducts(bonusProducts) {
    Console.print('=============증	정===============\n');
    Object.entries(bonusProducts).forEach(([name, quantity]) => {
      Console.print(`${name}		${quantity}\n`);
    });
  },

  printFooter({ totalBuyProductQuantity, totalBuyPrice, promotionSalePrice, membershipSalePrice, totalPayPrice }) {
    Console.print('====================================\n');
    Console.print(`총구매액		${totalBuyProductQuantity}	${totalBuyPrice.toLocaleString()}\n`);
    Console.print(`행사할인			-${promotionSalePrice.toLocaleString()}`);
    Console.print(`멤버십할인			-${membershipSalePrice.toLocaleString()}\n`);
    Console.print(`내실돈			 ${totalPayPrice.toLocaleString()}\n`);
  },
};

export default OutputView;
