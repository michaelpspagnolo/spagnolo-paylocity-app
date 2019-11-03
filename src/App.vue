<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <a href="https://paylocity.com" target="_blank">
          <v-img :src="require('./assets/logo-dark.png')" max-height="500" contain></v-img>
        </a>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text href="https://github.com/michaelpspagnolo/spagnolo-paylocity-app" target="_blank">
        <span class="mr-2">Source</span>
      </v-btn>
    </v-app-bar>

    <v-content>
      <Home />
    </v-content>
  </v-app>
</template>

<script>
import Home from "./components/Home";

export default {
  name: "App",
  components: {
    Home
  },
  data: () => ({
    //
  })
};
</script>
