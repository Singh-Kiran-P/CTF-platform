// function to get all ports from a response

import { is } from '@/shared/src/validation';

type Ports = {
    [string: string]: {
        HostIp: string,
        HortPort: string
    }[]
};

const ports = (ports: Ports): number[] => {
    if (!valid(ports)) return [];
    return [...new Set(Object.values(ports).map(v => v.map(d => Number.parseInt(d.HortPort)).filter(p => p && p > 0)).flat())];
}

const valid = (ports: any): boolean => {
    return is.object(ports) && Object.values(ports).every(v => is.array(v, d => is.string(d.HostIp) && is.string(d.HostPort)));
}

export default ports;
