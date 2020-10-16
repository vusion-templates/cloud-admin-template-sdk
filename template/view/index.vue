<template>
    <u-linear-layout direction="vertical">
        <div><%= title %>页面的内容</div>
        <router-view></router-view>
    </u-linear-layout>
</template>

<script>
export default {};
</script>

<definition>
{
    "title": "<%= title %>",
    "logics": []
}
</definition>
