import { State } from "./state.js";

export class County {
  /**
   * @param {*} id Unique county ID
   * @param {*} name County name
   * @param {string} state Name of state that this county belongs to
   */
  constructor(id, name, state) {
    this.id = id;
    if (typeof(name) === "string") {
      this.name = name;
    }
    this.state = state;
    this.statistics = {};
  }

  copy(county) {
    this.id = county.id;
    this.name = county.name;
    this.state = county.state;
    this.statistics = county.statistics;
  }

  /**
   * Updates the state that this county belongs to
   * @param {string} state New state that this county belongs to
   */
  updateState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  addCategory(category) {
    if (this.statistics[category] === undefined) {
      this.statistics[category] = {};
    }
  }

  updateStatistic(category, statistic, value) {
    this.statistics[category][statistic] = value;
  }

  getStatistic(category, statistic) {
    if (this.statistics[category] !== undefined) {
      return this.statistics[category][statistic];
    } else {
      console.warn("County " + this.id + " does not have category '" + category + "'");
      return 0;
    }
  }
}
