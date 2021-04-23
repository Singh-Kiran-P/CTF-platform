window.addEventListener('load', () => {
    let sliders = document.querySelectorAll('input[type=range]');
    for (let slider of sliders) {
        const update = slider => {
            if (slider.parentElement.classList.contains('doubleSlider')) {
                let parent = slider.parentElement;
                let classes = [['.min', Math.min], ['.max', Math.max]];
                if (slider.classList.contains('max')) classes.reverse();
                slider.value = classes[0][1](slider.value, parent.querySelector(classes[1][0]).value);
                parent.previousElementSibling.querySelector(classes[0][0]).innerHTML = slider.value;
            }
            else slider.previousElementSibling.innerHTML = slider.value;
        }
        update(slider);
        slider.addEventListener('input', e => update(e.target));
    };

    menuSize = parseInt(getProperty('--menu-size-val'));
    handleSize = parseInt(getProperty('--handle-size')) * 2;
    transitionTime = getProperty('--transition-time');
    const mouse = (e, f) => f(offset(e.clientX, e.clientY));
    const touch = (e, f) => f(offset(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
    const offset = (x, y) => parseInt(getComputedStyle(document.getElementById('menu')).getPropertyValue('border-top-width')) ? window.innerHeight - y - 1 : x;
    let clicks = [['mousedown', mouse, down], ['mousemove', mouse, move], ['mouseup', mouse, up], ['touchstart', touch, down], ['touchmove', touch, move], ['touchend', touch, up]];
    for (const click of clicks) document.addEventListener(click[0], (e) => click[1](e, click[2]));
});

const getProperty = p => getComputedStyle(document.documentElement).getPropertyValue(p);
const setProperty = (p, v) => document.documentElement.style.setProperty(p, v);
const getPopout = () => parseInt(getProperty('--menu-popout-val'));
const setPopout = v => setProperty('--menu-popout-val', v);
const setTranstition = b => setProperty('--transition-time', b ? transitionTime : '0s');

var menuSize;
var handleSize;
var transitionTime;

var oldOffset = undefined;
var offsetDiff = undefined;
var moved = false;

function down(offset) {
    let popout = getPopout();
    if (!isNaN(oldOffset) || offset < popout || offset > popout + handleSize) return;
    setTranstition(false);
    oldOffset = offset;
    offsetDiff = 0;
}

function move(offset) {
    if (isNaN(oldOffset)) return;
    let popout = getPopout();
    offset = Math.min(Math.max(offset, 0), menuSize + handleSize);
    let newPopout = Math.min(Math.max(popout + offset - oldOffset, 0), menuSize);
    setPopout(newPopout);
    offsetDiff = offset - oldOffset;
    oldOffset = offset;
    if (popout !== newPopout) moved = true;
    window.setTimeout(() => offsetDiff = 0, 10);
}

function up(offset) {
    if (isNaN(oldOffset)) return;
    setTranstition(true);
    if (offsetDiff == 0) offsetDiff = moved ? offset - menuSize / 2 : -getPopout() + 1;
    setPopout(offsetDiff >= 0 ? menuSize : 0);
    oldOffset = undefined;
    offsetDiff = undefined;
    moved = false;
}
