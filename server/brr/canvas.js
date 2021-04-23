var canvas;
var context;
var colors = [];

var config = {
    intVal: query => parseInt(document.querySelector(query).value),
    size: () => config.intVal('#size') * 25,
    points: () => config.intVal('#points'),
    colorStrength: () => config.intVal('#colorStrength'),
    colorSpeed: () => config.intVal('#colorSpeed') / 255 * 3,
    shapeSpeed: () => config.intVal('#shapeSpeed') * 5,
    colorBounds: () => {
        const v = query => config.intVal(query);
        return [[v('.min.red'), v('.max.red')], [v('.min.green'), v('.max.green')], [v('.min.blue'), v('.max.blue')]];
    },
    screenBounds: () => {
        let offset = [parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menu-popout-val')), 0];
        if (parseInt(getComputedStyle(document.getElementById('menu')).getPropertyValue('border-top-width'))) offset.reverse();
        return [[offset[0], canvas.width - 1], [0, canvas.height - 1 - offset[1]]];
    }
};

window.addEventListener('load', () => {
    canvas = document.getElementById('canvas');
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    setColors();
    draw();
    window.setInterval(animate, 1000 / 30);
});

function setCanvasSize() {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
    context = canvas.getContext('2d');
    if (colors.length > 0) draw();
}

function setColors() {
    let points = config.points();
    colors.length = Math.min(colors.length, points);
    const array = (l, f) => Array.from({length: l}, (_, i) => f(i));
    const rand = bounds => Math.floor(Math.random() * (bounds[1] - bounds[0] + 1)) + bounds[0];
    colors = colors.concat(array(Math.max(0, points - colors.length), () => ({
        p: array(2, i => rand(config.screenBounds()[i])),
        c: array(3, i => rand(config.colorBounds()[i])),
        dp: array(2, () => Math.random() - 0.5),
        dc: array(3, () => Math.random() - 0.5)
    })));
}

function animate() {
    const sign = (v, s) => (v < 0 && s > 0) || (v > 0 && s < 0) ? v * -1 : v;
    const apply = (v, d, m, b, r, c) => {
        c[v] = c[v].map((x, i) => x + c[d][i] * m * (r ? b[i][1] - b[i][0] + Math.max(b[i][0] - c[v][i], c[v][i] - b[i][1], 0) : 1));
        c[d] = c[d].map((x, i) => c[v][i] < b[i][0] || c[v][i] > b[i][1] ? sign(x, b[i][0] - c[v][i]) : x);
        return c;
    };
    if (colors.length != config.points()) setColors();
    colors = colors.map(c => apply('c', 'dc', config.colorSpeed(), config.colorBounds(), true, apply('p', 'dp', config.shapeSpeed(), config.screenBounds(), false, c)));

    const radius = 30 * 2;
    for (let i = 0; i < colors.length; ++i) {
        for (let j = i + 1; j < colors.length; ++j) {
            const c = [colors[i], colors[j]];
            let d = Math.sqrt(Math.pow(c[1].p[0] - c[0].p[0], 2) + Math.pow(c[1].p[1] - c[0].p[1], 2));
            if (d > radius) continue;
            let a = Math.atan2(c[1].p[1] - c[0].p[1], c[1].p[0] - c[0].p[0]);
            let aCoSi = [Math.cos(a), Math.sin(a)];
            [i, j].map((c, ci) => { colors[c].p = colors[c].p.map((x, xi) => x + (ci * 2 - 1) * (radius - d) * aCoSi[xi] / 2) });
        }
    }
    
    draw();
}

function draw() {
    const overflow = 2;
    const size = config.size();
    context.clearRect(0, 0, canvas.width, canvas.height);
    const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
    for (let y = 0, dy = Math.sqrt(Math.pow(size, 2) * 3) / 2, r = 0; y < canvas.height + size; y += dy, ++r) {
        for (let x = size / 2 * (r % 2); x < canvas.width + size; x += size) {
            let clr = gradientColor(x, y);
            let grd = context.createRadialGradient(x, y, 0, x, y, size * overflow);
            grd.addColorStop(0, rgba(clr, 0.5));
            grd.addColorStop(1, rgba(clr, 0));
            context.fillStyle = grd;
            context.fillRect(x - size * overflow, y - size * overflow, size * overflow * 2, size * overflow * 2);
        }
    }
}

function gradientColor(x, y) {
    let clrs = colors.map(c => Object.assign({d: Math.pow(c.p[0] - x, 2) + Math.pow(c.p[1] - y, 2)}, c)).sort((a, b) => a.d - b.d);
    let clr = [0, 0, 0];
    let scale = 0;

    for (let i = 0; i < clrs.length; ++i) {
        let m = Math.pow(clrs[i].d == 0 ? 1 : clrs[0].d / clrs[i].d, config.colorStrength());
        clr = clr.map((v, j) => v + clrs[i].c[j] * m);
        scale += m;
    }

    return clr.map(v => Math.max(0, Math.min(255, v / scale)));

    /* const angle = (x1, y1, x2, y2, x3, y3) => Math.abs(Math.atan2((x2 - x1) * (y2 - y3) - (y2 - y1) * (x2 - x3), (x2 - x1) * (x2 - x3) + (y2 - y1) * (y2 - y3)));
    let clrs = colors.map(c => Object.assign({
        d: Math.pow(c.p[0] - x, 2) + Math.pow(c.p[1] - y, 2),
        a: Math.atan2(c.p[1] - y, c.p[0] - x)
    }, c)).sort((a, b) => a.d - b.d);
    let clr = [0, 0, 0];
    let scale = 0;
    
    for (let i = 0; i < clrs.length; ++i) {
        let m = 1;
        for (let j = i - 1; j >= 0; --j) {
            let a1 = angle(x, y, clrs[i].p[0], clrs[i].p[1], clrs[j].p[0], clrs[j].p[1]);
            let a2 = Math.abs(Math.abs(clrs[i].a - clrs[j].a) - Math.PI) - a1;
            m = Math.min(m, a2 == 0 ? 0 : a1 / a2);
        }
        m = Math.pow(m, config.colorStrength());
        clr = clr.map((v, j) => v + clrs[i].c[j] * m);
        scale += m;
    }

    return clr.map(v => Math.max(0, Math.min(255, v / scale))); */
}
