import PromotionManager from '../controller/PromotionManager.js';
import Inventory from '../controller/Inventory.js';

class ConvenienceStore {
  #inventory = new Inventory();

  #promotionManager = new PromotionManager();

  async init() {
    await this.#inventory.init();
    await this.#promotionManager.init();
  }

  getInventory() {
    return this.#inventory;
  }

  getPromotionManager() {
    return this.#promotionManager;
  }
}

export default ConvenienceStore;
