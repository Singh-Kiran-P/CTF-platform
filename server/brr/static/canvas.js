var canvas;
var context;
var colors = [];

var config = {
    points: () => 5,
    colorStrength: () => 2,
    colorBounds: () => [[0, 255], [0, 255], [0, 255]],
    screenBounds: () => [[0, canvas.width - 1], [0, canvas.height - 1]]
};

window.addEventListener('load', () => {
    canvas = document.getElementById('canvas');
    setCanvasSize();
    setColors();
    draw();
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
        c: array(3, i => rand(config.colorBounds()[i]))
    })));
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = context.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < img.data.length; i += 4) {
        let x = (i / 4) % canvas.width, y = Math.floor((i / 4) / canvas.width);
        gradientColor(x, y).concat([255]).map((v, j) => { img.data[i + j] = v; });
    }
    context.putImageData(img, 0, 0);
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
