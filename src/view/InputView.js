import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Console } from '@woowacourse/mission-utils';

const InputView = {
  async readItem() {
    const input = await Console.readLineAsync('구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])');
  },

  async readProducts() {
    // const filename = fileURLToPath(import.meta.url);
    // const dirname = path.dirname(filename);
    // const filePath = path.join(dirname, '..', 'public', 'products.md');

    try {
      // const data = await fs.readFile(filePath, 'utf8');
      const data = `name,price,quantity,promotion
콜라,1000,10,탄산2+1
콜라,1000,10,null
사이다,1000,8,탄산2+1
사이다,1000,7,null
오렌지주스,1800,9,MD추천상품
탄산수,1200,5,탄산2+1
물,500,10,null
비타민워터,1500,6,null
감자칩,1500,5,반짝할인
감자칩,1500,5,null
초코바,1200,5,MD추천상품
초코바,1200,5,null
에너지바,2000,5,null
정식도시락,6400,8,null
컵라면,1700,1,MD추천상품
컵라면,1700,10,null
`;

      return data;
    } catch (error) {
      this.throwError(`products.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);

      return null;
    }
  },

  async readPromotions() {
    // const filename = fileURLToPath(import.meta.url);
    // const dirname = path.dirname(filename);
    // const filePath = path.join(dirname, '..', 'public', 'promotions.md');

    try {
      // const data = await fs.readFile(filePath, 'utf8');
      const data = `name,buy,get,start_date,end_date
탄산2+1,2,1,2024-01-01,2024-12-31
MD추천상품,1,1,2024-01-01,2024-12-31
반짝할인,1,1,2024-11-01,2024-11-30
      `;

      return data;
    } catch (error) {
      this.throwError(`promotions.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);

      return null;
    }
  },
};

export default InputView;
