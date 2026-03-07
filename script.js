document.addEventListener('DOMContentLoaded', function () {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    if (!musicToggle || !bgMusic) return;

    bgMusic.volume = 0.5;

    musicToggle.textContent = bgMusic.paused ? 'Play Music' : 'Pause Music';

    musicToggle.addEventListener('click', async function () {
        try {
            if (bgMusic.paused) {
                await bgMusic.play();
                musicToggle.textContent = 'Pause Music';
            } else {
                bgMusic.pause();
                musicToggle.textContent = 'Play Music';
            }
        } catch (err) {
            console.error('Audio playback failed:', err);
        }
    });

    const mainEl = document.querySelector('main.content');
    if (!mainEl) return;

    document.addEventListener('click', function (e) {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || a.target === '_blank') return;
        let url;
        try { url = new URL(href, location.href); } catch (err) { return; }
        if (url.origin !== location.origin) return;
        if (!url.pathname.endsWith('.html') && url.pathname === location.pathname) return;

        e.preventDefault();
        navigateTo(url.href);
    });

    window.addEventListener('popstate', function () {
        navigateTo(location.href, { replace: true });
    });

    async function navigateTo(href, opts = {}) {
        try {
            const res = await fetch(href, { cache: 'no-cache' });
            if (!res.ok) { location.href = href; return; }
            const text = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const newMain = doc.querySelector('main.content');
            if (!newMain) { location.href = href; return; }

            mainEl.innerHTML = newMain.innerHTML;
            const newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;
            if (!opts.replace) history.pushState({}, '', href);

            runScripts(mainEl);

            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Navigation failed, performing full load:', err);
            location.href = href;
        }
    }

    function runScripts(container) {
        const scripts = Array.from(container.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            const s = document.createElement('script');
            if (oldScript.src) s.src = oldScript.src;
            else s.textContent = oldScript.textContent;
            document.body.appendChild(s);
            oldScript.remove();
        });
    }
});