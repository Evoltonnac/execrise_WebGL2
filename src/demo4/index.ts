import forwardRender from './forwardRender';
import deferredRender from './deferredRender';

(function main() {
    let renderType = 'forward';
    let render = forwardRender();
    const toggleRenderType = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const type = (input && input.id) || renderType;
        if (type !== renderType) {
            if (type === 'forward') {
                render = forwardRender();
            } else if (type === 'deferred') {
                render = deferredRender();
            }
            renderType = type;
        }
    };
    document
        .querySelector('#forward')
        ?.addEventListener('click', toggleRenderType);
    document
        .querySelector('#deferred')
        ?.addEventListener('click', toggleRenderType);

    let time = Date.now();
    const rate = 15;
    let angle = 0;
    function draw() {
        requestAnimationFrame(() => {
            const now = Date.now();
            const offset = now - time;
            angle += (offset / 1000) * rate;
            time = now;
            render(angle);
            draw();
        });
    }
    draw();
})();
