type LL = { next: LL|null };
type Pile = { top: LL, bottom: LL, left: Pile|null, right: Pile|null };

function * iterlist(l: LL) {
  do {
    const n = l.next;
    yield l;
    l = n;
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
  let right = last;
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
    first.top = next.next;

    // link it to the previous output element
    last.next = next;

    // If there are no more piles, exit, preserving the rest of this pile's chain.
    const second = first.right;
    if (!second) break;

    // make this the previous output element
    last = next;

    if (!first.top) {
      // 2. If the first pile is now empty,
      // discard that pile, and make the second pile first
      first = second;
      continue;
    }

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

  return head.next
}

function distribute(g: Iterator<LL>, cmp: (a: LL, b: LL) => -1|0|1) {
  // 1. Take the first input item and create an initial leftmost pile.
  const first = cons_pile(null, g.next().value);
  let pile = first;
  let side = 1;
  // 2. If no more items, exit
  outer: for (let input = g.next(); !input.done; input = g.next()) {
    // 3. Take the next input item for comparison.
    const next = input.value;
    let changed_sides = false;
    inner: for (;;) {
      // 4. Select the last pile for comparison as the current pile.
      // Maintain the same side as the last comparison
      if (side === 1) {
        for (;;) {
          switch (cmp(next, pile.bottom)) {
            case 0: {
              // 5. If the new item is equal to the bottom of the current pile,
              // append it to the bottom of the current pile and go to 2
              push_bottom(pile, next);
              continue outer;
            }
            case 1: {
              // 6. If the new item is greater than the bottom of the current pile...
              if (pile.left) {
                // ...and the current pile is not the first pile,
                // select the left pile, and go to 5.
                pile = pile.left;
                continue;
              } else {
                // 7. ...and the current pile is the first pile,
                // append the new item to the bottom of the current pile
                // and go to 2.
                push_bottom(pile, next)
                continue outer;
              }
            }
            case -1: {
              // 8. If the new item is contained in the current pile
              // and this is not the rightmost pile, append it to the
              // bottom of the right pile and go to 2.
              if (pile.right) {
                push_bottom(pile.right, next);
                pile = pile.right;
                continue outer;
              } else {
                // 9. If the current pile is the rightmost pile
                // and only one side has been compared, switch sides
                // and go to 4.
                if (!changed_sides) {
                  side = 0;
                  changed_sides = true;
                  continue inner;
                }
                break inner;
              }
            }
          }
        }
      } else {
        for (;;) {
          switch (cmp(next, pile.top)) {
            case 0: {
              // 5. If the new item is equal to the top of the current pile,
              // append it to the top of the current pile and go to 2
              push_top(pile, next);
              continue outer;
            }
            case -1: {
              // 6. If the new item is less than the top of the current pile...
              if (pile.left) {
                // ...and the current pile is not the first pile,
                // select the left pile, and go to 5.
                pile = pile.left;
                continue;
              } else {
                // 7. ...and the current pile is the first pile,
                // append the new item to the top of the current pile
                // and go to 2.
                push_top(pile, next)
                continue outer;
              }
            }
            case 1: {
              // 8. If the new item is contained in the current pile
              // and this is not the rightmost pile, append it to the
              // top of the right pile and go to 2.
              if (pile.right) {
                push_top(pile.right, next);
                pile = pile.right;
                continue outer;
              } else {
                // 9. If the current pile is the rightmost pile
                // and only one side has been compared, switch sides
                // and go to 4.
                if (!changed_sides) {
                  side = 1;
                  changed_sides = true;
                  continue inner;
                }
                break inner;
              }
            }
          }
        }
      }
    }
    // 10. Both top and bottom have been searched without a match.
    // Create a new pile with the new item, append it to the right
    // of the rightmost (current) pile, and go to 2.
    pile.right = cons_pile(pile, next);
    pile = pile.right;
  }

  return first;
}

function sort(head: LL, cmp: (a: LL, b: LL) => -1|0|1) {
  // Distribute the list into piles.
  const pile = distribute(iterlist(head), cmp);

  // If there's only one pile, it's already sorted.
  if (!pile.right) return pile.top;

  // Merge the lists from each pile.
  return merge_piles(pile, cmp);
  
}