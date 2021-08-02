const stateStore = {
  themeName: 'chalk',
};

const mutations = {
  changeTheme(state) {
    if (state.themeName === 'chalk') {
      state.themeName = 'vintage';
    } else {
      state.themeName = 'chalk';
    }
  },
};

export default {
  state: stateStore,
  mutations,
};
