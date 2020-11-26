export default {
    title: '{{ title }}',
    name: '{{ name }}',
    project: '{{ appName }}',
    domainName: '{{ appName }}',
    nuimsDomain: '{{ nuimsDomain }}',
    auth: {{ auth }},
    router: {
        notFound: '/',
        middleware: ['first', 'lock', 'auth', 'login'],
        effect: ['title'],
        tipMessage: '没有访问该页面的权限',
        unauthorized: '/',
        noLogin() {
            window.location.href = '/';
        },
        base: '/{{ name }}',
    },
};
