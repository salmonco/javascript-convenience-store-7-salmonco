import Inventory from '../src/controller/Inventory.js';

describe('Inventory', () => {
  let inventory;

  beforeEach(async () => {
    inventory = new Inventory();

    await inventory.init();
  });

  test('상품 목록을 초기화한다.', async () => {
    const products = inventory.getProducts();

    expect(products[0].getName()).toBe('콜라');
    expect(products[0].getPromotion()).toBe('탄산2+1');
    expect(products[1].getName()).toBe('콜라');
    expect(products[1].getPromotion()).toBe('null');
  });

  test('상품 목록에서 이름으로 상품을 가져온다.', async () => {
    const { promotionProduct, generalProduct } = inventory.getProductByName('콜라');

    expect(promotionProduct.getName()).toBe('콜라');
    expect(promotionProduct.getPromotion()).toBe('탄산2+1');
    expect(generalProduct.getName()).toBe('콜라');
    expect(generalProduct.getPromotion()).toBe('null');
  });
});
