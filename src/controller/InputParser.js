const InputParser = {
  parseProducts(data) {
    const products = [];
    const onlyPromotionProducts = {};

    data
      .split('\n')
      .slice(1, -1)
      .forEach((line) => {
        const [name, price, quantity, promotion] = line.split(',');

        products.push({ name, promotion, price: Number(price), quantity: Number(quantity) });
      });

    products.forEach((product) => {
      onlyPromotionProducts[product.name] = true;

      if (product.promotion === 'null') {
        onlyPromotionProducts[product.name] = false;
      }
    });

    Object.entries(onlyPromotionProducts).forEach(([name]) => {
      if (!onlyPromotionProducts[name]) return;
      // 프로모션 상품만 있는 경우 재고 없는 일반 상품도 추가
      const { price } = products.find((prod) => prod.name === name);
      const promotionIdx = products.findIndex((prod) => prod.name === name);

      products.splice(promotionIdx + 1, 0, {
        name,
        price,
        quantity: 0,
        promotion: 'null',
      });
    });

    return products;
  },

  parsePromotions(data) {
    const promotions = [];

    data
      .split('\n')
      .slice(1, -1)
      .forEach((line) => {
        const [name, buy, get, startDate, endDate] = line.split(',');

        promotions.push({ name, startDate, endDate, buy: Number(buy), get: Number(get) });
      });

    return promotions;
  },
};

export default InputParser;
