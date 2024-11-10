const INPUT_MESSAGES = {
  BUY_PRODUCT: '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
  ADD_PROMOTION: (buyProduct, moreGetQuantity) =>
    `현재 ${buyProduct.name}은(는) ${moreGetQuantity}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
  MEMBERSHIP_SALE: '\n멤버십 할인을 받으시겠습니까? (Y/N)\n',
  PROMOTION_NOT_APPLIED: (productName, remainBuyProductQuantity) =>
    `\n현재 ${productName} ${remainBuyProductQuantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
  ADDITIONAL_PURCHASE: '\n감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n',
};

const OUTPUT_MESSAGES = {
  WELCOME: '안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n',
  RECEIPT_HEADER: '\n==============W 편의점================\n',
  PRODUCT_LIST_HEADER: '상품명		수량	금액\n',
  PRODUCT_LIST_ITEM: (name, quantity, totalPricePerProduct) =>
    `${name}		${quantity}	${totalPricePerProduct.toLocaleString()}\n`,
  BONUS_HEADER: '=============증	정===============\n',
  BONUS_ITEM: (name, quantity) => `${name}		${quantity}\n`,
  RECEIPT_FOOTER: '====================================\n',
  TOTAL_BUY_AMOUNT: (totalBuyProductQuantity, totalBuyPrice) =>
    `총구매액		${totalBuyProductQuantity}	${totalBuyPrice.toLocaleString()}\n`,
  PROMOTION_DISCOUNT: (promotionSalePrice) => `행사할인			-${promotionSalePrice.toLocaleString()}`,
  MEMBERSHIP_DISCOUNT: (membershipSalePrice) => `멤버십할인			-${membershipSalePrice.toLocaleString()}\n`,
  TOTAL_PAY_AMOUNT: (totalPayPrice) => `내실돈			 ${totalPayPrice.toLocaleString()}\n`,
};

const ERROR_MESSAGES = {
  EXCEED_STOCK: '재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
  INVALID_INPUT: '올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
};

export { INPUT_MESSAGES, OUTPUT_MESSAGES, ERROR_MESSAGES };
