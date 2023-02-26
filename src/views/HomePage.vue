<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col class="text-center" cols="12" md="4" sm="8">
        <v-img src="src/assets/logo.png" />
        <SearchTitle />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SearchTitle from "@/components/SearchTitle.vue";

export default {
  name: "HomePage",
  components: { SearchTitle },
};
</script>

<style lang="scss" scoped></style>
