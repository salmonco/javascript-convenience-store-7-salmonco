import { Console } from '@woowacourse/mission-utils';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class App {
  async run() {
    // 상품 목록과 행사 목록을 파일 입출력을 통해 불러온다.
    const products = [];
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    const filePath = path.join(dirname, '..', 'public', 'products.md');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      data
        .split('\n')
        .slice(1, -1)
        .forEach((line) => {
          const [name, price, quantity, promotion] = line.split(',');
          products.push({ name, price, quantity, promotion });
        });
    } catch (error) {
      this.throwError(`products.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
    }

    const promotions = [];
    const promotionFilePath = path.join(dirname, '..', 'public', 'promotions.md');
    try {
      const data = await fs.readFile(promotionFilePath, 'utf8');
      data
        .split('\n')
        .slice(1, -1)
        .forEach((line) => {
          const [name, buy, get, startDate, endDate] = line.split(',');
          promotions.push({ name, buy, get, startDate, endDate });
        });
    } catch (error) {
      this.throwError(`promotions.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
    }

    // 환영 인사와 함께 상품명, 가격, 프로모션 이름, 재고를 안내한다. 만약 재고가 0개라면 재고 없음을 출력한다.
    Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
    this.printProducts(products);

    // 구매할 상품명과 수량을 입력받는다.
    const buy = await Console.readLineAsync('\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n');

    // 개별 상품을 쉼표(,)로 파싱한다.
    const buyList = buy.split(',');
    console.log(buyList);
  }

  throwError(message) {
    throw new Error(`[ERROR] ${message}`);
  }

  printProducts(products) {
    products.forEach((product) => {
      const { name, price, quantity, promotion } = product;

      let quantityMessage = `${quantity}개`;

      if (quantity === 0) {
        quantityMessage = '재고 없음';
      }

      let promotionMessage = promotion;
      if (promotion === 'null') {
        promotionMessage = '';
      }

      Console.print(`- ${name} ${Number(price).toLocaleString()}원 ${quantityMessage} ${promotionMessage}`);
    });
  }
}

export default App;
