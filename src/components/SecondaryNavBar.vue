<template>
    <footer class="choice-bar bg-body-tertiary">
        <a class="choice-bar-choice" :class="{ active: activeType === 'maps' }" aria-current="page" href="#"
           @click="onClick('maps')">Kaarten</a>
        <a class="choice-bar-choice" :class="{ active: activeType === 'other' }" href="#" @click="onClick('other')">Andere
            Statistieken</a>
    </footer>
</template>

<script>
export default {
    name: "SecondaryNavBar",
    methods: {
        onClick(type) {
            this.activeType = type;
            this.$emit("tabSelected", type);
        }
    },
    data() {
        return {
            activeType: 'maps',
        }
    }
};
</script>

<style scoped>
.choice-bar {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    background-color: dimgrey;
}

.choice-bar-choice {
    margin: 10px 10px;
    color: dimgrey;
    text-decoration: none;
    padding: 0.5rem;
}

.active {
    text-decoration: underline;
    color: black;
}
</style>