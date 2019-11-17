type LL = { next: LL|null };
type Pile = { top: LL, bottom: LL, left: Pile|null, right: Pile|null };

function * iterlist(l: LL) {
  do {
    const n = l.next;
    yield l;
    l = n as LL;
  } while(l);
}

function push_bottom(pile: Pile, l: LL) {
  pile.bottom.next = l;
  pile.bottom = l;
  l.next = null;
}

function push_top(pile: Pile, l: LL) {
  l.next = pile.top;
  pile.top = l;
}

function cons_pile(left: Pile|null, l: LL) {
  l.next = null;
  return { top: l, bottom: l, left, right: null } as Pile;
}

function insert(c: Pile, last: Pile, cmp: (a: LL, b: LL) => -1|0|1) {
  // Loop until we hit the end or find a pile
  // that this one should be inserted before.
  let right: Pile | null = last;
  do {
    last = right;
    right = last.right;
    if (!right) { // insert at end
      last.right = c;
      c.left = last;
      c.right = null;
      return;
    }
  } while (cmp(c.top, right.top) === 1);
  // insert in the middle
  last.right = c;
  right.left = c;
  c.left = last;
  c.right = right;
}

function merge_piles(first: Pile, cmp: (a: LL, b: LL) => -1|0|1) {
  const head = { next: null } as LL;
  let last = head;
  
  for (;;) {
    // 1. Output the first element of the first pile
    const next = first.top;

    // link it to the previous output element
    last.next = next;

    // If there are no more piles, exit, preserving the rest of this pile's chain.
    const second = first.right;
    if (!second) break;

    // make this the previous output element
    last = next;

    if (!next.next) {
      // 2. If the first pile is now empty,
      // discard that pile, and make the second pile first
      first = second;
      continue;
    }

    first.top = next.next;

    // 3. Compare the next item to the top item on the second pile
    if (cmp(first.top, second.top) === 1) {
      // 4. If it is out of order, Pull the current first pile out of the
      // list and reinsert it at the correct location in the list of piles.
      const current = first;
      first = second;
      first.left = null;

      insert(current, first, cmp);
    }
  }

  return head.next;
}

function distribute(g: IterableIterator<LL>, cmp: (a: LL, b: LL) => -1|0|1) {
  // Initialize the leftmost pile with the first item.
  const pre = { right: cons_pile(null, g.next().value) } as Pile;
  // For each additional item, iterate piles until we find out where it goes
  outer: for (let item of g) {
    let pile = pre;
    do {
      pile = pile.right as Pile;
      if (cmp(item, pile.top) < 1) {
        push_top(pile, item);
        continue outer;
      }
      if (cmp(item, pile.bottom) > -1) {
        push_bottom(pile, item);
        continue outer;
      }
    } while(pile.right);

    pile.right = cons_pile(pile, item);
  }

  return pre.right as Pile;
}

export default function unshuffle(head: LL, cmp: (a: LL, b: LL) => -1|0|1) {
  // Distribute the list into piles.
  const pile = distribute(iterlist(head), cmp);

  // If there's only one pile, it's already sorted.
  if (!pile.right) return pile.top;

  // Merge the lists from each pile.
  return merge_piles(pile, cmp);
  
}