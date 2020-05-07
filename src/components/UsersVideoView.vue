<template>
  <div class="container">
    <div class='video-row'>
      <video v-bind:src=ownVideoStream muted autoplay/>
    </div>
  </div>
</template>

<script>

export default {
  name: 'UserVideoView',
  props: {
    ownVideoStream: MediaStream,
  },
  data() {
    return {

    };
  },
}

</script>

<style>
</style>
