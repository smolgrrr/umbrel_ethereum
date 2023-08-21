import API from "@/helpers/api";

// Initial state
const state = () => ({
  ethereumConfig: {}
});

// Functions to update the state directly
const mutations = {
  setethereumConfig(state, ethereumConfig) {
    state.ethereumConfig = ethereumConfig;
  }
};

const actions = {
  async getethereumConfig({ commit }) {
    const existingConfig = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/ethereumd/system/ethereum-config`
    );

    if (existingConfig) {
      commit("setethereumConfig", existingConfig);
    }
  },
  updateethereumConfig({ commit }, ethereumConfig) {
    commit("setethereumConfig", ethereumConfig);
  }
};

const getters = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
