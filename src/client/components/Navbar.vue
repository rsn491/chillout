<template>
    <div v-bind:style="{ backgroundColor: backgroundColor }" class='navbar navbar-expand-lg justify-content-between'>
        <div class="navbar-brand">
            <div class='app-logo' />
        </div>
        <div class="navbar-controls">
            <button v-if=onShareRoom class="btn material-icons" v-on:click="onShareRoom">person_add</button>
            <button v-if=onStartTriviaGame class="btn material-icons" v-on:click="onStartTriviaGame">videogame_asset</button>
            <button v-if=onOpenShareYoutube class="btn material-icons" v-on:click="onOpenShareYoutube">theaters</button>
            <button v-if=onToggleMic class="btn material-icons" v-on:click="onToggleMic">{{muted ? 'mic_off': 'mic'}}</button>
            <button v-if=onToggleCamera class="btn material-icons" v-on:click="onToggleCamera">{{cameraOn ? 'videocam': 'videocam_off'}}</button>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Navbar',
    props: {
      backgroundColor: {
          type: String,
          default: '#3E5C76'
      },
      onShareRoom: Function,
      onStartTriviaGame: Function,
      onOpenShareYoutube: Function,
      onToggleMic: Function,
      onToggleCamera: Function,
      muted: Boolean,
      cameraOn: Boolean,
    },
};

</script>

<style scoped>

    .navbar {
        align-content: center;
        display: flex;
        padding: 8px;
        height: 60px;
    }

    .navbar .app-logo {
        height: 50px;
        width: 50px;
    }

    .navbar-controls .btn {
        border: none;
        color: #F0F3F5;
        font-size: 1.25rem;
        height: 48px;
        margin: 1px;
        width: 48px;
    }

    .navbar-controls .btn:hover {
        opacity: 0.7;
    }

</style>
