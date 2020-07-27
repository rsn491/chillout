<template>
    <div class="room-notification-container">
        <div class="room-notification" v-if="type==NotificationTypes.INVITING_FOR_TRIVIA_GAME">
            <span class="material-icons">videogame_asset</span>
            <span>Inviting other users for a trivia game</span><span class="dot">...</span>
        </div>
        <div class="room-notification" v-if="type===NotificationTypes.INVITED_FOR_TRIVIA_GAME">
            <span class="material-icons">videogame_asset</span>
            <div>You were invited for a game of trivia<span class="dot">...</span></div>
        </div>
    </div>
</template>

<script>

export const NotificationTypes = {
    INVITING_FOR_TRIVIA_GAME: 0,
    INVITED_FOR_TRIVIA_GAME: 1,
};

export default {
    name: 'RoomNotification',
    props: {
        type: Number,
        validator: (value) => value === null|| !!Object.values(NotificationTypes).find(type => type === value),
    },
    created() {
        this.NotificationTypes = NotificationTypes;
    },
};

</script>

<style scoped>

@keyframes blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.dot {
  animation: blink 2s infinite;
}

.room-notification-container {
    display: flex;
    height: 40px;
    justify-content: center;
    padding-top: 4px;
    position: absolute;
    width: 100%;
}

.room-notification {
    align-items: center;
    background-color: #F0F3F5;
    color: #39373a;
    display: flex;
    font-size: 18px;
    left: 4px;
    padding: 8px;
}

.room-notification .material-icons {
    color: #3E5C76;
    margin-right: 8px;
}

</style>
