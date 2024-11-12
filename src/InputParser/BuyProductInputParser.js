const BuyProductInputParser = {
  parseBuyItem(buy) {
    const [name, quantity] = buy.slice(1, -1).split('-');

    return { name, quantity: Number(quantity) };
  },

  splitWithHyphen(array) {
    return array.map(this.parseBuyItem);
  },
};

export default BuyProductInputParser;
