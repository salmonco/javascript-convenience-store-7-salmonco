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
      this.throwError(`파일을 불러오는 중 오류가 발생했습니다. ${error.message}`);
    }
  }

  throwError(message) {
    throw new Error(`[ERROR] ${message}`);
  }
}

export default App;
