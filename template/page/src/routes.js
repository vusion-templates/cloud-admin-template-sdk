import appConfig from './app.config';
import routes from './routes.map.js?scopeName=/';
import utils from '@/global/utils';
let defaultRoute = appConfig.router.defaults;
let notFoundRoute = appConfig.router.notFound;
let unauthorized = appConfig.router.unauthorized;

if (!utils.hasRoute(routes.children || [], defaultRoute)) {
    if (routes.length) {
        defaultRoute = routes.path;
    } else {
        defaultRoute = '';
    }
}

if (!utils.hasRoute(routes.children || [], notFoundRoute)) {
    notFoundRoute = '/';
}

if (!utils.hasRoute(routes.children || [], unauthorized)) {
    unauthorized = '/';
}

Object.assign(appConfig.router, {
    defaultRoute,
    notFoundRoute,
    unauthorized,
});

routes.children = routes.children || [];
if (routes.children.length && routes.children[0].path === '') {
    routes.children[0].redirect = defaultRoute;
}

export default [
    routes,
    { path: '*', beforeEnter(to, from, next) {
        if (window.microApp && window.microApp.isMicro) {
            if (!location.pathname.startsWith(window.microApp.prefix)) {
                next();
                return;
            }
        }
        next(notFoundRoute); // 无法匹配的链接跳转
    } },
];
