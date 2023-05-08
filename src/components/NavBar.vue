<script>
</script>

<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary sticky-top">
        <div class="navbar-inner-wrapper container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                    aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <router-link class="nav-link" aria-current="page" to="/">Introduction</router-link>
                    <router-link class="nav-link" aria-current="page" to="/statistics">Statistics</router-link>
                    <router-link class="nav-link" aria-current="page" to="/about">About</router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
@media (min-width: 992px) {
    .navbar-inner-wrapper {
        max-width: 75%;
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
        border-bottom: 2px solid black;
        margin: auto;
        background-color: white !important;
    }

    .navbar {
        background-color: transparent !important;
        padding: 0;
    }

    .navbar-nav {
        margin: auto;
    }

    .nav-link {
        font-size: 1.3rem;
        margin-right: 2.5rem;
        margin-left: 2.5rem;
    }
}
</style>