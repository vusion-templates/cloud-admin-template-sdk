import router from '@/global/features/router';
import appConfig from './app.config';
import routes from './routes';
let routerInstance;
export default routerInstance;
export function initRouter(base) {
    routerInstance = router(
        routes,
        base,
        appConfig,
    );
    return routerInstance;
}
