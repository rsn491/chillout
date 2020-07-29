# chillout

<img
  src="public/img/icon.png"
  alt="chillout"
  width="200"
/>

# Quickstart

You can easily start Chillout with docker by running the following command:

docker-compose up --build -d

You can now access the Chillout app at: http://0.0.0.0:3000

## 1. Install deps
  ```
  npm install
  ```
## 2. Start backend server
  ```
  node server.js
  ```
## 3. Start peerjs server (signaling)
  ```
  docker run -p 9000:9000 -d peerjs/peerjs-server
  ```
## 4. Start hot-reload dev server
  ```
  npm run serve
  ```

# Other cmds

## Compiles and minifies for production
```
npm run build
```

## Run your tests
```
npm run test
```

## Lints and fixes files
```
npm run lint
```
