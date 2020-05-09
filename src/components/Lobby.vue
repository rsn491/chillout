<template>
    <form @submit="submit">
        <button type="submit" name="host">Host</button>
        
        <label for="roomid">Room:</label>
        <input id="roomid" style="text" v-model="roomId"/>
        
        <button type="submit" name="join">Join</button>
      </form>
</template>
<script>
export default {
    props: ['host', 'join'],
    data() {
        return {
            roomId: '',
        }
    },
    methods: {
        submit(e) {
            e.preventDefault();

            const submitter = e.submitter.name;
            switch(submitter) {
                case "host":
                    return this.$props.host();
                case "join":
                    return this.$props.join({ 
                        roomId: this.roomId, 
                    })
                default:
                    console.warn(`Unknown submitter ${submitter}`);
            }
        }
    }
}
</script>