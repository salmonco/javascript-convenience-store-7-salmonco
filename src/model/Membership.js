class Membership {
  #isMembership = false;

  setMembership(isMembership) {
    this.#isMembership = isMembership;
  }

  getMembership() {
    return this.#isMembership;
  }

  setMembershipByAnswer(answer) {
    this.#isMembership = answer === 'Y';
  }
}

export default Membership;
