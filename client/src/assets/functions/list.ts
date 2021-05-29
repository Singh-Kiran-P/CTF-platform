// general functions for vue lists

import Vue from 'vue';
import axios from 'axios';
import { is } from '@shared/validation';

type Order = { order: number };

const nextOrder = <T>(list: (T & Order)[]): number => list.reduce((x, y) => Math.max(x, y.order), 0) + 1;

const moveDown = <T>(list: (T & Order)[], order: number): void => {
    let i = list.findIndex(x => x.order == order);
    if (i < 0 || i >= list.length - 1) return;
    let temp = list[i];
    let set = (x: (T & Order), y: (T & Order)) => Object.assign({}, y, { order: x.order });
    Vue.set(list, i, set(list[i], list[i + 1]));
    Vue.set(list, i + 1, set(list[i + 1], temp));
}

const toggledItems = <C>(container: C & Object, loading: string, visible: boolean | undefined, items: any[] | undefined, loadItems: (c: C) => any): void => {
    if (visible && items == undefined) {
        Vue.set(container, loading, true);
        loadItems(container);
    }
}

const loadItems = (container: { id?: number, }, list: string, loading: string, visible: string, request: string, getValid: (data: any) => boolean): Promise<void> => {
    return new Promise<void>(resolve => {
        const setItems = (items?: any[]) => {
            Vue.set(container, list, items);
            Vue.set(container, loading, false);
            resolve();
        }
        if (!container.id) setItems([]);
        else {
            const error = () => {
                Vue.set(container, visible, false);
                setItems(undefined);
            };

            axios.get(request + container.id).then(res => {
                if (res.data.error || (!is.array(res.data, _ => false) && !getValid(res.data))) error();
                else setItems(res.data);
            }).catch(() => error());
        }
    });
}

export { nextOrder, moveDown, toggledItems, loadItems };
