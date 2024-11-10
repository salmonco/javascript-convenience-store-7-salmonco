import parseLineWithCallback from '../util/parseLineWithCallback.js';

const PromotionInputParser = {
  parsePromotions(data) {
    return parseLineWithCallback(data, this.parsePromotionLine);
  },

  parsePromotionLine(line) {
    const [name, buy, get, startDate, endDate] = line.split(',');

    return { name, startDate, endDate, buy: Number(buy), get: Number(get) };
  },
};

export default PromotionInputParser;
