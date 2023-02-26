<template>
  ssss
  <v-app>
    <v-app-bar
      :value="showAppBar && this.$route.name === 'Seasons'"
      app
      class="pr-12"
      flat
      height="100"
    >
      <v-img
        @click="goHome"
        class="mr-4"
        max-height="80"
        max-width="110"
        src="src/assets/logo.png"
        style="cursor: pointer"
      />
      <SearchTitle v-if="showAppBar" />
    </v-app-bar>
    <router-view />
  </v-app>
</template>

<script>
import SearchTitle from "@/components/SearchTitle.vue";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "App",
  components: { SearchTitle },
  mounted() {
    console.log(this.imageHeight);
  },

  computed: {
    ...mapGetters(["showAppBar"]),
  },
  methods: {
    ...mapMutations(["setRankedSeasons", "setInput"]),
    goHome() {
      this.setRankedSeasons([]);
      this.setInput("");
      this.$router.push("/");
    },
  },
};
</script>
