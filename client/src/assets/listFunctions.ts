// general functions for vue lists

import Vue from 'vue';

type Order = { order: number };

const nextOrder = <T>(list: (T & Order)[]): number => list.reduce((x, y) => Math.max(x, y.order), 0) + 1;

const moveDown = <T>(list: (T & Order)[], predicate: (x: T & Order) => boolean): void => {
    let i = list.findIndex(x => predicate(x));
    if (i < 0 || i >= list.length - 1) return;
    let temp = list[i];
    let set = (x: (T & Order), y: (T & Order)) => Object.assign({}, y, { order: x.order });
    Vue.set(list, i, set(list[i], list[i + 1]));
    Vue.set(list, i + 1, set(list[i + 1], temp));
};

export { nextOrder, moveDown };
