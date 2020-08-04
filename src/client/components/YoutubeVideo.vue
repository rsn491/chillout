<template>
    <div class="container video-container" v-if=url>
        <iframe id="ytplayer" type="text/html"
            :src="`https://www.youtube.com/embed/${getYoutubeVideoId(url)}?autoplay=1`"
            frameborder="0">
        </iframe>
    </div>
</template>

<script>

export default {
    name: 'YoutubeVideo',
    props: {
        url: String,
    },
    methods: {
        getYoutubeVideoId(youtubeVideoUrl) {
            const url = new URL(youtubeVideoUrl);
            const queryParams = new URLSearchParams(url.search);

            return queryParams.has("v")
                ? queryParams.get("v")
                : url.pathname.substring(1);
        },
    },
};

</script>

<style scoped>

.video-container {
  height: 60vh;
  display: flex;
}

.video-container iframe {
  height: auto;
  width: 100%;
}

</style>
