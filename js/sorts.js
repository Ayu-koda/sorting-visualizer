// Each algorithm works on a COPY of the array and only records what happened:
//   e('c',i,j) compare | e('s',i,j) swap | e('w',i,v) write | e('p',i) pivot | e('d',i) sorted
// main.js then replays those steps as animation, so the speed slider works live.
const SORTS = {
  Bubble: { best:'Ω(N)', avg:'Θ(N²)', worst:'O(N²)', space:'O(1)',
    run(a, e) {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
          e('c', j, j + 1);
          if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; e('s', j, j + 1); swapped = true; }
        }
        e('d', n - i - 1);
        if (!swapped) break;
      }
    } },

  Selection: { best:'Ω(N²)', avg:'Θ(N²)', worst:'O(N²)', space:'O(1)',
    run(a, e) {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let m = i;
        e('p', i);
        for (let j = i + 1; j < n; j++) { e('c', m, j); if (a[j] < a[m]) m = j; }
        if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; e('s', i, m); }
        e('d', i);
      }
    } },

  Insertion: { best:'Ω(N)', avg:'Θ(N²)', worst:'O(N²)', space:'O(1)',
    run(a, e) {
      for (let i = 1; i < a.length; i++) {
        for (let j = i; j > 0; j--) {
          e('c', j - 1, j);
          if (a[j - 1] <= a[j]) break;
          [a[j - 1], a[j]] = [a[j], a[j - 1]]; e('s', j - 1, j);
        }
      }
    } },

  Merge: { best:'Ω(N log N)', avg:'Θ(N log N)', worst:'O(N log N)', space:'O(N)',
    run(a, e) {
      const sort = (l, r) => {
        if (l >= r) return;
        const m = (l + r) >> 1;
        sort(l, m); sort(m + 1, r);
        const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < L.length || j < R.length) {
          if (i < L.length && j < R.length) e('c', l + i, m + 1 + j);
          a[k] = (j >= R.length || (i < L.length && L[i] <= R[j])) ? L[i++] : R[j++];
          e('w', k, a[k]); k++;
        }
      };
      sort(0, a.length - 1);
    } },

  Quick: { best:'Ω(N log N)', avg:'Θ(N log N)', worst:'O(N²)', space:'O(log N)',
    run(a, e) {
      const sort = (lo, hi) => {
        if (lo >= hi) { if (lo === hi) e('d', lo); return; }
        const piv = a[hi]; let i = lo;
        e('p', hi);
        for (let j = lo; j < hi; j++) {
          e('c', j, hi);
          if (a[j] < piv) { if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; e('s', i, j); } i++; }
        }
        if (i !== hi) { [a[i], a[hi]] = [a[hi], a[i]]; e('s', i, hi); }
        e('d', i);
        sort(lo, i - 1); sort(i + 1, hi);
      };
      sort(0, a.length - 1);
    } },

  Heap: { best:'Ω(N log N)', avg:'Θ(N log N)', worst:'O(N log N)', space:'O(1)',
    run(a, e) {
      const sift = (n, i) => {
        for (;;) {
          let big = i; const l = 2 * i + 1, r = l + 1;
          if (l < n) { e('c', l, big); if (a[l] > a[big]) big = l; }
          if (r < n) { e('c', r, big); if (a[r] > a[big]) big = r; }
          if (big === i) return;
          [a[i], a[big]] = [a[big], a[i]]; e('s', i, big); i = big;
        }
      };
      const n = a.length;
      for (let i = (n >> 1) - 1; i >= 0; i--) sift(n, i);
      for (let i = n - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]]; e('s', 0, i); e('d', i);
        sift(i, 0);
      }
    } }
};
