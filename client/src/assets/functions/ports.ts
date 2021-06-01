// functions to get all ports from a response

import { is } from '@/shared/src/validation';

type PortsA = {
    [string: string]: { HostPort: string }[]
};

const portsa = (ports: PortsA): number[] => {
    if (!valida(ports)) return [];
    return [...new Set(Object.values(ports).filter(v => v).map(v => v.map(d => Number.parseInt(d.HostPort)).filter(p => p && p > 0)).flat())];
}

const valida = (ports: any): boolean => {
    return is.object(ports) && Object.values(ports).filter(v => v).every(v => is.array(v, d => is.string(d.HostPort)));
}

type PortsB = {
    PublicPort: number
}[];

const portsb = (ports: PortsB): number[] => {
    if (!validb(ports)) return [];
    return [...new Set(ports.map(p => p.PublicPort).filter(p => p && p > 0))];
}

const validb = (ports: any): boolean => {
    return is.array(ports, p => is.object(p));
}

export { portsa, portsb };
