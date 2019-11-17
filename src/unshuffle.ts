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
  // Initialize one pile with the first item.
  const first = cons_pile(null, g.next().value);
  let last = first;
  let side = 1; // top
  outer: for (let item of g) {
    // For each item, figure out which pile it goes in.
    // 1. Select the rightmost pile for comparison.
    let pile = last;
    let switched = false;
    inner: for(;;) {
      if (side === 1) {
        switch (cmp(item, pile.top)) {
          case 0: {
            // 2. If the item is equal to the top of the pile,
            //    append to the top of the pile.
            push_top(pile, item);
            continue outer; // get the next item
          }
          case -1: {
            // 3. If the item is less than the top:
            if (pile.left) {
              // 3.1 If the pile is not leftmost, move left and go to 2
              pile = pile.left;
              continue inner;
            }
            // 3.2 Else, append to the top of the pile.
            push_top(pile, item);
            continue outer; // get the next item
          }
          case 1: {
            // 4. If the item is contained in the current pile:
            if (pile.right) {
              // 4.1 If the pile is not rightmost,
              //     append to the top of the right pile.
              push_top(pile.right, item);
              continue outer; // get the next item
            }
          }
        }
      } else {
        switch (cmp(item, pile.bottom)) {
          case 0: {
            // 2. If the item is equal to the bottom of the pile,
            //    append to the bottom of the pile.
            push_bottom(pile, item);
            continue outer; // get the next item
          }
          case 1: {
            // 3. If the item is greater than the bottom:
            if (pile.left) {
              // 3.1 If the pile is not leftmost, move left and go to 2
              pile = pile.left;
              continue inner;
            }
            // 3.2 Else, append to the bottom of the pile.
            push_bottom(pile, item);
            continue outer; // get the next item
          }
          case -1: {
            // 4. If the item is contained in the current pile:
            if (pile.right) {
              // 4.1 If the pile is not rightmost,
              //     append to the bottom of the right pile
              push_bottom(pile.right, item);
              continue outer; // get the next item
            }
            // 4.2 The current pile is rightmost;
            if (switched) {
              // If both sides have been compared, the item matches no pile.
              break inner;
            }
            // If only one side has been compared, switch sides and go to 2
            side = 1;
            switched = true;
          }
        }
      }

      // 4.2 The current pile is rightmost;
      if (switched) {
        // If both sides have been compared, the item matches no pile.
        break inner;
      }

      // If only one side has been compared, switch sides and go to 2
      side = 1-side;
      switched = true;
    }

    // 5. Both top and bottom have been searched, and no pile was matched.
    //    Create a new rightmost pile to hold the item.
    last.right = cons_pile(last, item);
    last = last.right;
  }

  return first;
}

export default function unshuffle(head: LL, cmp: (a: LL, b: LL) => -1|0|1) {
  // Distribute the list into piles.
  const pile = distribute(iterlist(head), cmp);

  // If there's only one pile, it's already sorted.
  if (!pile.right) return pile.top;

  // Merge the lists from each pile.
  return merge_piles(pile, cmp);
}