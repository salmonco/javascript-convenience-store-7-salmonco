const ReceiptCalculator = {
  calculate({ generalBuyProducts, promotionBuyProducts, bonusProducts, products, isMembership }) {
    const totalBuyProducts = this.calculateTotalBuyProducts(generalBuyProducts, promotionBuyProducts);
    const generalBuyProductsTotalPrice = this.calculateGeneralBuyProductsTotalPrice(generalBuyProducts, products);
    const totalBuyProductQuantity = this.calculateTotalBuyProductQuantity(generalBuyProducts, promotionBuyProducts);
    const totalBuyPrice = this.calculateTotalBuyPrice(totalBuyProducts, products);
    const promotionSalePrice = this.calculatePromotionSalePrice(bonusProducts, products);
    const membershipSalePrice = this.calculateMembershipSalePrice(isMembership, generalBuyProductsTotalPrice);
    const totalPayPrice = this.calculateTotalPayPrice(totalBuyPrice, promotionSalePrice, membershipSalePrice);

    return {
      totalBuyProducts,
      totalBuyProductQuantity,
      totalBuyPrice,
      promotionSalePrice,
      membershipSalePrice,
      totalPayPrice,
    };
  },

  calculateGeneralBuyProductsTotalPrice(generalBuyProducts, products) {
    let generalBuyProductsTotalPrice = 0;

    Object.entries(generalBuyProducts).forEach(([name, quantity]) => {
      const price = products.find((product) => product.getName() === name).getPrice();

      generalBuyProductsTotalPrice += price * quantity;
    });

    return generalBuyProductsTotalPrice;
  },

  calculateTotalBuyProductQuantity(generalBuyProducts, promotionBuyProducts) {
    let totalBuyProductQuantity = 0;

    Object.values(generalBuyProducts).forEach((quantity) => {
      totalBuyProductQuantity += quantity;
    });

    Object.values(promotionBuyProducts).forEach((quantity) => {
      totalBuyProductQuantity += quantity;
    });

    return totalBuyProductQuantity;
  },

  calculateTotalBuyProducts(generalBuyProducts, promotionBuyProducts) {
    const totalBuyProducts = {};

    Object.entries(generalBuyProducts).forEach(([name, quantity]) => {
      totalBuyProducts[name] = totalBuyProducts[name] + quantity || quantity;
    });

    Object.entries(promotionBuyProducts).forEach(([name, quantity]) => {
      totalBuyProducts[name] = totalBuyProducts[name] + quantity || quantity;
    });

    return totalBuyProducts;
  },

  calculateTotalBuyPrice(totalBuyProducts, products) {
    let totalBuyPrice = 0;

    Object.entries(totalBuyProducts).forEach(([name, quantity]) => {
      const price = products.find((product) => product.getName() === name).getPrice();
      const totalPrice = price * quantity;

      totalBuyPrice += totalPrice;
    });

    return totalBuyPrice;
  },

  calculatePromotionSalePrice(bonusProducts, products) {
    let promotionSalePrice = 0;

    Object.entries(bonusProducts).forEach(([name, quantity]) => {
      const price = products.find((product) => product.getName() === name).getPrice();

      promotionSalePrice += quantity * price;
    });

    return promotionSalePrice;
  },

  calculateMembershipSalePrice(isMembership, generalBuyProductsTotalPrice) {
    if (!isMembership) {
      return 0;
    }

    let membershipSalePrice = generalBuyProductsTotalPrice * 0.3;

    if (membershipSalePrice > 8000) {
      membershipSalePrice = 8000;
    }

    return membershipSalePrice;
  },

  calculateTotalPayPrice(totalBuyPrice, promotionSalePrice, membershipSalePrice) {
    return totalBuyPrice - promotionSalePrice - membershipSalePrice;
  },

  calculateTotalPricePerProduct(products, name, quantity) {
    const price = products.find((product) => product.getName() === name).getPrice();

    return price * quantity;
  },
};

export default ReceiptCalculator;
