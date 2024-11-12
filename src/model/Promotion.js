class Promotion {
  #name;

  #buy;

  #get;

  #startDate;

  #endDate;

  constructor({ name, buy, get, startDate, endDate }) {
    this.#name = name;
    this.#buy = buy;
    this.#get = get;
    this.#startDate = startDate;
    this.#endDate = endDate;
  }

  getName() {
    return this.#name;
  }

  getBuy() {
    return this.#buy;
  }

  getGet() {
    return this.#get;
  }

  getStartDate() {
    return this.#startDate;
  }

  getEndDate() {
    return this.#endDate;
  }
}

export default Promotion;
