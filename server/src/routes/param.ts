import express from 'express';

const param = (req: express.Request, i: number): string => {
    let url = req.originalUrl;
    for (;;) {
        while (url.startsWith('/')) url = url.slice(1);
        if (i-- == 0) return url;
        let slash = url.indexOf('/');
        if (slash < 0) return '';
        url = url.slice(slash);
    };
}

export default param;
