export default {
    title: '{{ title }}',
    name: '{{ name }}',
    project: '{{ appName }}',
    domainName: '{{ appName }}',
    auth: {{ auth }},
    router: {
        notFound: '/',
        middleware: ['lock', 'auth'],
        effect: ['title'],
        tipMessage: '没有访问该页面的权限',
        unauthorized: '/',
        noLogin() {
            window.location.href = '/';
        },
        base: '/{{ name }}',
    },
};
