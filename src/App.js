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
  }

  throwError(message) {
    throw new Error(`[ERROR] ${message}`);
  }
}

export default App;
