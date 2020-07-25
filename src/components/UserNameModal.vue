<template>
<div class="modal-open">
  <div class="modal d-block" aria-modal="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
      
        <div class="modal-header">
          <h4 class="modal-title">Pick your username</h4>
        </div>
        
        <div class="modal-body">
          <input type="text" placeholder="username" :value=username />
          <button class="btn material-icons" v-on:click="generateRandomUsername">replay</button>
        </div>
        
        <div class="modal-footer">
          <button class="btn shadow-blue-btn" v-on:click="() => onUsernamePicked(username)">Ok</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show"></div>
</div>
</template>

<script>

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export default {
    name: 'UserNameModal',
    props: {
      onUsernamePicked: Function,
    },
    data() {
        return {
            username: uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }),
        }
    },
    methods: {
        generateRandomUsername() {
            this.username = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
        }
    },
}

</script>

<style scoped>

.modal-header {
  border-bottom: 0;
  justify-content: center;
}

.modal-body {
  text-align: center;
}

.modal-footer {
  border-top: 0;
  justify-content: center;
}

</style>