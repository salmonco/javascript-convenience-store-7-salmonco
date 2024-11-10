import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Console } from '@woowacourse/mission-utils';
import InputParser from '../controller/InputParser.js';
import { PRODUCT_DATA, PROMOTION_DATA } from '../constant/fileData.js';

const InputView = {
  async readProducts() {
    // const filename = fileURLToPath(import.meta.url);
    // const dirname = path.dirname(filename);
    // const filePath = path.join(dirname, '..', 'public', 'products.md');

    try {
      //   const data = await fs.readFile(filePath, 'utf8');
      //   return data;
      return PRODUCT_DATA;
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
      //   const data = await fs.readFile(filePath, 'utf8');
      //   return data;
      return PROMOTION_DATA;
    } catch (error) {
      this.throwError(`promotions.md 파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
      return null;
    }
  },
  readItem() {
    return Console.readLineAsync('\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n');
  },
  readGetMorePromotionChoice(products, promotions, buyProduct) {
    const moreGetQuantity = InputParser.calculateMoreGetQuantity(products, promotions, buyProduct);

    return Console.readLineAsync(
      `현재 ${buyProduct.name}은(는) ${moreGetQuantity}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
    );
  },
  readMembershipSaleChoice() {
    return Console.readLineAsync('\n멤버십 할인을 받으시겠습니까? (Y/N)\n');
  },
  readBuyConinueChoice(productName, remainBuyProductQuantity) {
    return Console.readLineAsync(
      `\n현재 ${productName} ${remainBuyProductQuantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
    );
  },
};

export default InputView;
