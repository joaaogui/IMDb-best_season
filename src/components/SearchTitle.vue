<template>
  <v-text-field
    @keyup.enter="searchTitle"
    hide-details="auto"
    placeholder="Enter the show name"
    v-model="seriesName"
    :loading="loading"
    :error-messages="errorMessage"
  />
</template>

<script>
import { mapState } from "vuex";
import { searchTitle } from "@/utils/rankSeasons.js";

export default {
  name: "SearchTitle",
  data: () => ({
    seriesName: "",
    loading: false,
    errorMessage: "",
  }),
  mounted() {
    this.seriesName = this.input;
  },
  computed: {
    ...mapState(["input"]),
  },
  methods: {
    async searchTitle() {
      this.loading = true;
      this.errorMessage = "";
      try {
        await searchTitle(this.seriesName);
        this.$router.push({
          name: "Seasons",
          params: { title: this.seriesName },
        });
      } catch (e) {
        this.errorMessage = "Show not found!";
      }
      this.loading = false;
    },
  },
};
</script>
