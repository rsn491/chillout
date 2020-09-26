<template>
    <div class="home-page">
        <Navbar backgroundColor="transparent"/>
        <div class="home-page-container">
            <h1>chillout</h1>
            <h2>P2P video chat app for hanging out with friends</h2>

            <div class="app-logo-container">
                <div class="app-logo"/>
                <img src="https://img.shields.io/github/stars/rsn491/chillout?style=social"/>
            </div>

            <button class="btn confirm-btn red-btn" v-on:click=host>Try It Now</button>
        </div>
    </div>
</template>

<script>

import Navbar from '../components/Navbar';

export default {
    name: 'home',
    components: {
        Navbar,
    },
    methods: {
        host() {
            this.$router.push({ path: 'room' });
        },
    },
}
</script>

<style>
    .home-page {
        background-image: linear-gradient(0, #3e5c76, 30%, #39373a);
        height: 100vh;
    }

    .app-logo {
        background-size: contain;
        background-position-x: center;
        background-repeat: no-repeat;
        background-image: url(/img/icon.png);
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
        color: #FDFFFC;
        margin-top: 80px;
    }

    h2 {
        color: #F4FFFD;
    }

    .btn:focus {
        box-shadow: none;
    }

    .confirm-btn {
        padding: 12px 48px;
    }

    .red-btn {
        background-color: #CE4257;
        color: #F0F3F5;
        transition: padding 0.6s;
    }

    .red-btn:hover {
        background-color: #b63a4c;
        color: #F0F3F5;
        padding: 12px 60px;
    }

    .light-blue-btn {
        background-color: #7C98B3;
        color: #F0F3F5;
    }

    .light-blue-btn:hover {
        background-color: #5c7185;
        color: #F0F3F5;
    }

    .shadow-blue-btn {
        background-color: #3e5c76;
        color: #F0F3F5;
    }

    .shadow-blue-btn:hover {
        background-color: #253847;
        color: #F0F3F5;
    }

</style>
