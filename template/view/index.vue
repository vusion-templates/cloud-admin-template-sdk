<template>
    <u-linear-layout direction="vertical">
        <u-text text="<%= title %>页面的内容"></u-text>
        <u-linear-layout direction="vertical"></u-linear-layout>
        <router-view></router-view>
    </u-linear-layout>
</template>

<script>
export default {};
</script>

<definition>
{
    "title": "<%= title %>",
    "crumb": "<%= crumb %>",
    "logics": []
}
</definition>
