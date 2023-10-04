const baseUrl = 'https://localhost:5050/';

setBreadcrumb();

function setBreadcrumb() {
    let url = formatUrl();
    if (url == '') { return; }
    
    let breadcrumb = document.getElementById('breadcrumb');

    breadcrumb.appendChild(createBreadcrumb(`${url}`));
}
function createBreadcrumb(url) {
    let div = document.createElement('div');
    div.classList.add('container-fluid');
    let nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'breadcrumb');
    let ol = document.createElement('ol');
    ol.classList.add('breadcrumb', 'breadcrumb-chevron', 'p-3', 'bg-body-tertiary', 'rounded-3');

    ol.appendChild(addHomeBreadcrumb());

    url = url.split('/');
    let currentUrl = '';
    for (let i = 0; i < url.length-1; i++) {
        currentUrl += `/${url[i]}`;
        ol.appendChild(addBreadcrumb(toTitleCase(url[i]), currentUrl));
    }
    currentUrl += `/${url[url.length-1]}`;
    ol.appendChild(addCurrentBreadcrumb(toTitleCase(url[url.length-1]), currentUrl))

    nav.appendChild(ol);
    div.appendChild(nav);
    return div;
}
function addHomeBreadcrumb() {
    let li = document.createElement('li');
    li.classList.add('breadcrumb-item');
    let a = document.createElement('a');
    a.classList.add('link-body-emphasis');
    a.setAttribute('href', '/');
    let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.classList.add('bi');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#house-door-fill');
    let span = document.createElement('span');
    span.classList.add('visually-hidden');
    span.innerHTML = 'Home';

    svg.appendChild(use);
    a.appendChild(svg);
    a.appendChild(span);
    li.appendChild(a);
    return li;
}
function addBreadcrumb(name, url) {
    let li = document.createElement('li');
    li.classList.add('breadcrumb-item');
    let a = document.createElement('a');
    a.classList.add('link-body-emphasis', 'fw-semibold', 'text-decoration-none');
    a.setAttribute('href', url);
    a.innerHTML = name;

    li.appendChild(a);
    return li;
}
function addCurrentBreadcrumb(name) {
    let li = document.createElement('li');
    li.classList.add('breadcrumb-item', 'active');
    li.setAttribute('aria-current', 'page');
    li.innerHTML = name;

    return li;
}
function toTitleCase(string) {
    let words = string.split('-');
    let result = [];
    words.forEach(e => {
        result.push(`${e[0].toUpperCase()}${e.substring(1)}`);
    });
    return result.join(' ');
}

function formatUrl() {
    let url = document.location.href;
    url = url.substring(baseUrl.length-1).replace('#', '');

    if (url.indexOf('?') >= 0) { url = url.substring(0, url.indexOf('?')); }
    if (url.at(-1) == '/') { url = url.substring(0, url.length-1); }
    return url;
}