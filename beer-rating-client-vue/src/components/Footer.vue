<script lang="ts">
const today = new Date();
export default {
    data() {
        return {
            thisYear: today.getFullYear()
        };
    }
};
</script>

<template>
    <footer>
        &copy; {{ thisYear }} Sebastian Försth. All rights reserved.
    </footer>
</template>

<style scoped>
footer {
    padding: 2em 1em 6em 1em;
    background: linear-gradient(var(--gray-gradient)) no-repeat;
    color: rgb(var(--gray));
    text-align: center;
}
</style>