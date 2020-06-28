import appConfig from './app.config';
import rootRoute from './rootRoute.map.js?rootPath=/';
import utils from '@/global/utils';
let notFoundRoute = appConfig.router.notFound;
let unauthorized = appConfig.router.unauthorized;

if (!utils.hasRoute(rootRoute.children || [], notFoundRoute)) {
    notFoundRoute = '/';
}

if (!utils.hasRoute(rootRoute.children || [], unauthorized)) {
    unauthorized = '/';
}

Object.assign(appConfig.router, {
    notFoundRoute,
    unauthorized,
});

export default [
    rootRoute,
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
