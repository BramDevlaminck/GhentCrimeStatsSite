<template>
    <footer class="choice-bar bg-body-tertiary">
        <div class="choice-bar-choice" :class="{ active: activeType === 'maps' }" aria-current="page"
           @click="onClick('maps')">Per wijk</div>
        <div class="choice-bar-choice" :class="{ active: activeType === 'other' }" @click="onClick('other')">
            Algemene inzichten
        </div>
    </footer>
</template>

<script>
export default {
    name: "SecondaryNavBar",
    methods: {
        onClick(type) {
            this.activeType = type;
            this.$emit("tabSelected", type);
            window.scrollTo(0, 0);
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
.choice-bar-choice:hover {
    cursor: pointer;
}

.active {
    text-decoration: underline;
    color: black;
}
</style>