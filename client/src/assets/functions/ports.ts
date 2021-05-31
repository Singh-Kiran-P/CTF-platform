// function to get all ports from a response

import { is } from '@shared/validation';

type PortsA = {
    [string: string]: {
        HostIp: string,
        HostPort: string
    }[]
};

const portsa = (ports: PortsA): number[] => {
    if (!valida(ports)) return [];
    return [...new Set(Object.values(ports).map(v => v.map(d => Number.parseInt(d.HostPort)).filter(p => p && p > 0)).flat())];
}

const valida = (ports: any): boolean => {
    return is.object(ports) && Object.values(ports).every(v => is.array(v, d => is.string(d.HostIp) && is.string(d.HostPort)));
}

type PortsB = {
    PublicPort: number
}[];

const portsb = (ports: PortsB): number[] => {
    console.log(ports);

    if (!validb(ports)) return [];
    console.log("valid");

    return [...new Set(ports.map(p => p.PublicPort).filter(p => p && p > 0))];
}

const validb = (ports: any): boolean => {
    return is.array(ports, p => is.object(p));
}

export { portsa, portsb };
