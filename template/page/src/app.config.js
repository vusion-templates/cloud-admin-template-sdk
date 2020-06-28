export default {
    title: '{{ title }}',
    name: '{{ name }}',
    project: '{{ appName }}',
    auth: {{ auth }},
    router: {
        defaults: '/overview',
        notFound: '/overview',
        unauthorized: '/overview',
    },
    navInfo: {
        navbar: [],
        sidebar: [],
    },
};
