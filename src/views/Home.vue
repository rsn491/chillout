<template>
    <div>
        <div class='navbar navbar-expand-lg'>
            <div class="navbar-brand">
                <div class='app-logo' />
            </div>
        </div>
        <div class="home-page-container">
            <h1>P2P video-chat web app <br> for hanging out with friends</h1>

            <div class="app-logo-container">
                <div class="app-logo"/>
                <img src="https://img.shields.io/github/stars/rsn491/chillout?style=social"/>
            </div>
                
            <button class="btn shadow-blue-btn" v-on:click=host>Try it out</button>
        </div>
    </div>
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

<style>
    .app-logo {
        background-size: contain;
        background-position-x: center;
        background-repeat: no-repeat;
        background-image: url(/img/icon.png);
    }

    .navbar .app-logo {
        height: 50px;
        width: 50px;
    }

    .app-logo-container .app-logo {
        height: 100px;
        margin: 16px;
        width: 100px;
    }

    .app-logo-container {
        align-items: center;
        display: flex;
        flex-flow: column;
        margin: 45px;
    }

    .home-page-container {
        align-items: center;
        display: flex;
        flex-flow: column;
        justify-content: center;
        text-align: center;
    }

    h1 {
        background-color: #F0F3F5;
        color: #0D1321;
        padding: 80px;
        width: 100%
    }

    .btn:focus {
        box-shadow: none;
    }

    .shadow-blue-btn {
        background-color: #748CAB;
        color: #F0F3F5;
    }

    .shadow-blue-btn:hover {
        background-color: #1D2D44;
        color: #F0F3F5;
    }

</style>