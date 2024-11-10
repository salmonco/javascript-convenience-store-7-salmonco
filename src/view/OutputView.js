import { Console } from '@woowacourse/mission-utils';
import ReceiptCalculator from '../controller/ReceiptCalculator.js';
import { OUTPUT_MESSAGES } from '../constant/message.js';

const OutputView = {
  printWelcome(products) {
    Console.print(OUTPUT_MESSAGES.WELCOME);
    OutputView.printProducts(products);
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
    Console.print(OUTPUT_MESSAGES.RECEIPT_HEADER);
  },

  printBody(totalBuyProducts, products, bonusProducts) {
    this.printPerProduct(totalBuyProducts, products);
    this.printBonusProducts(bonusProducts);
  },

  printPerProduct(totalBuyProducts, products) {
    Console.print(OUTPUT_MESSAGES.PRODUCT_LIST_HEADER);
    Object.entries(totalBuyProducts).forEach(([name, quantity]) => {
      const totalPricePerProduct = ReceiptCalculator.calculateTotalPricePerProduct(products, name, quantity);

      Console.print(OUTPUT_MESSAGES.PRODUCT_LIST_ITEM(name, quantity, totalPricePerProduct));
    });
  },

  printBonusProducts(bonusProducts) {
    Console.print(OUTPUT_MESSAGES.BONUS_HEADER);
    Object.entries(bonusProducts).forEach(([name, quantity]) => {
      Console.print(OUTPUT_MESSAGES.BONUS_ITEM(name, quantity));
    });
  },

  printFooter({ totalBuyProductQuantity, totalBuyPrice, promotionSalePrice, membershipSalePrice, totalPayPrice }) {
    Console.print(OUTPUT_MESSAGES.RECEIPT_FOOTER);
    Console.print(OUTPUT_MESSAGES.TOTAL_BUY_AMOUNT(totalBuyProductQuantity, totalBuyPrice));
    Console.print(OUTPUT_MESSAGES.PROMOTION_DISCOUNT(promotionSalePrice));
    Console.print(OUTPUT_MESSAGES.MEMBERSHIP_DISCOUNT(membershipSalePrice));
    Console.print(OUTPUT_MESSAGES.TOTAL_PAY_AMOUNT(totalPayPrice));
  },
};

export default OutputView;
