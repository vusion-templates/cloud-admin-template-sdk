<template>
    <u-linear-layout direction="vertical">
        <span>content</span>
        <router-view></router-view>
    </u-linear-layout>
</template>

<script>
import gql from 'index.gql';

export default {
    data() {
        return {
            
        };
    },
    apollo: {
      queryAll:  gql
    },
};
</script>

<style module>

</style>
