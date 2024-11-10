const PRODUCT_DATA = `name,price,quantity,promotion
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

const PROMOTION_DATA = `name,buy,get,start_date,end_date
탄산2+1,2,1,2024-01-01,2024-12-31
MD추천상품,1,1,2024-01-01,2024-12-31
반짝할인,1,1,2024-11-01,2024-11-30
`;

export { PRODUCT_DATA, PROMOTION_DATA };
