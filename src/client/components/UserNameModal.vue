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
          <button class="btn light-blue-btn material-icons" v-on:click="generateRandomUsername">replay</button>
        </div>

        <div class="modal-footer">
          <button class="btn shadow-blue-btn confirm-btn" v-on:click="() => onUsernamePicked(username)">Ok</button>
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
  display: flex;
}

.modal-body input {
  border: 1px solid #748CAB;
  border-radius: 2px;
  height: 44px;
  flex-grow: 1;
  padding: 8px;
  margin-right: 4px;
}

.modal-body button {
  font-size: 20px;
}

.modal-body input:focus {
  border: 2px solid #748CAB;
  outline: none;
}

.modal-footer {
  border-top: 0;
  justify-content: center;
}

</style>
