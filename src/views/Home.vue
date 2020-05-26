<template>
    <button v-on:click=host>Start new session</button>
</template>

<script>
export default {
    name: 'home',
    methods: {
        host() {
            this.$router.push({ path: 'room' });
        },
    },
}
</script>
