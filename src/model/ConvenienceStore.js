import Inventory from './Inventory.js';
import Promotion from './Promotion.js';

class ConvenienceStore {
  #inventory = new Inventory();

  #promotion = new Promotion();

  async init() {
    await this.#inventory.initInventory();
    await this.#promotion.initPromotions();
  }

  getInventory() {
    return this.#inventory;
  }

  getPromotion() {
    return this.#promotion;
  }
}

export default ConvenienceStore;
