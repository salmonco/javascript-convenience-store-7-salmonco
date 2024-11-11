import BuyProductManager from '../src/controller/BuyProductManager.js';
import Product from '../src/model/Product.js';

describe('BuyProductManager', () => {
  let buyProductManager;

  beforeEach(() => {
    buyProductManager = new BuyProductManager();
    buyProductManager.init();
  });

  test('일반 상품을 구매하면 구매 상품의 수량이 증가한다.', () => {
    const generalProduct = new Product({ name: '콜라', price: 1000, quantity: 1, promotion: 'null' });
    buyProductManager.buyWithGeneralProduct(generalProduct, '콜라', 1);

    const result = buyProductManager.getGeneralBuyProducts();

    expect(result).toEqual({ 콜라: 1 });
  });

  test('프로모션 상품을 구매하면 구매 상품의 수량이 증가한다.', () => {
    const promotionProduct = new Product({ name: '콜라', price: 1000, quantity: 1, promotion: '콜라 1+1' });
    buyProductManager.buyWithPromotionProduct(promotionProduct, '콜라', 1);

    const result = buyProductManager.getPromotionBuyProducts();

    expect(result).toEqual({ 콜라: 1 });
  });

  test('일반 재고가 없는 경우 구매할 수 없다.', () => {
    const generalProduct = new Product({ name: '콜라', price: 1000, quantity: 0, promotion: 'null' });

    expect(() => {
      BuyProductManager.canBuyWithGeneralProduct(generalProduct, 1);
    }).toThrow('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
  });

  test('일반 재고가 있는 경우 구매할 수 있다.', () => {
    const generalProduct = new Product({ name: '콜라', price: 1000, quantity: 1, promotion: 'null' });
    const result = BuyProductManager.canBuyWithGeneralProduct(generalProduct, 1);

    expect(result).toBeTruthy();
  });
});
