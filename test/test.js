const { expect } = require('chai');
const { unshuffle } = require('../dist');

function randLL(n){
  const head = { value: Math.round(Math.random() * 1000), next: null };
  let node = head;
  for (;n>0;n--) {
    node.next = { value: Math.round(Math.random() * 1000), next: null };
    node = node.next;
  }
  return head;
}

function cmp(a, b) {
  return a.value - b.value;
}

function isSorted(l) {
  while(l) {
    const { next } = l;
    if (next && next.value < l.value) return false;
    l = next;
  }
  return true;
}

describe("test sorting", () => {
  it("should recognize unsorted lists", () => {
    expect(isSorted(randLL(100))).to.eql(false);
  });

  it("should sort short linked lists", () => {
    for (let i = 10; i < 100; i++) {
      expect(isSorted(unshuffle(randLL(i), cmp))).to.eql(true);
    }
  });

  it("should sort long linked lists", () => {
    for (let i = 500; i < 1000; i++) {
      expect(isSorted(unshuffle(randLL(i), cmp))).to.eql(true);
    }
  });
});