Unshuffle
=========

This library provides an implementation of the [Unshuffle](http://tasneemrumy05.blogspot.com/2007/10/unshuffle-algorithm.html) [Sort Algorithm](https://www.askdbmgt.com/uploads/4/6/2/4/46246531/unshuffle.pdf) for linked lists. This is an in-place sort that uses a worst-case O(n/2) amount of scratch space to re-configure the links in a singly-linked list to put the elements in sorted order. It is designed to efficiently exploit existing runs of ordered or anti-ordered elements, having a time complexity of O(kn), where k is a constant proportional to the amount of entropy in the input data. For totally random data, k approaches log(n).

The module exports a single `unshuffle` function with the following signatures:

* `function unshuffle<C extends { value: number }, L extends C>(head: L, cmp?: null,      ptr?: keyof L): L`
* `function unshuffle<C,                           L extends C>(head: L, cmp: Compare<C>, ptr?: keyof L): L`

where `Compare<C>` is an alias for `<C>(a: C, b: C) => number`--i.e., a generic comparison function that takes two objects of the same type and returns a negative number is a < b, zero if a = b, and a positive number if a > b;

The type `L` represents a generic linked list node--i.e., an object that has a field pointing to another object conforming to the same interface--which must also be comparable by the given comparator function. If no comparator function is supplied (it is left out, or `null` or `undefined` are passed in), the default comparator requires `L` objects to have a numeric `value` field. Additionally, by default `unshuffle` will require that `L` objects are linked by a `next` field pointing to another `L` object or null; however, that can be overwritten by providing the optional `ptr` argument to specify an alternate name for the link-pointer field, which must be a key of whatever the `L` type actually is. (Unfortunately, the TypeScript type system is not quite powerful enough to statically guarantee that custom pointer fields actually recursively point to additional `L` values; if you use custom pointer fields, you are on your own to ensure that they are properly typed.)

Examples
--------
```
const { unshuffle } = require('unshuffle');

function randLinkedList(n, key){
  // Note that we are using the default 'value' field with numeric values,
  // so we won't need to pass in a custom comparison function for sorting.
  const head = { value: Math.round(Math.random() * 1000), [key]: null };
  let node = head;
  for (;n>0;n--) {
    node = node[key] = { value: Math.round(Math.random() * 1000), [key]: null };
  }
  return head;
}

let unsortedHead = randLinkedList(100, 'next');
let sortedHead = unshuffle(unsortedHead);
// sortedHead is an element of the list originally headed by,
// unsortedHead, which will now appear somewhere in the middle
// of the list because links were re-arranged in-place.

// let's try a list with a different link pointer field
unsortedHead = randLinkedList(100, 'foo');
sortedHead = unshuffle(unsortedHead, null /* still using the default comparator */, 'foo');
```