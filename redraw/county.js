import { State } from "./state.js";

export class County {
  /**
   * @param {*} id Unique county ID
   * @param {*} name County name
   * @param {State} state State that this county belongs to
   */
  constructor(id, name, state) {
    this.meta = {
      id: id,
      name: name
    };
    this.state = state;
    this.politics = {
      presidential2016: {},
      presidential2012: {}
    };
    this.population = {
      general: {
        age: {},
        sex: {},
        race: {},
        employment: {}
      },
      households: {
        status: {
          marital: {},
          types: {},
          poverty: {
            foodStamps: {}
          },
          language: {}
        },
        income: {},
      },
      education: {
        enrollment: {},
        attainment: {}
      }
    };
  }

  /**
   * Updates the state that this county belongs to
   * @param {State} state New state that this county belongs to
   */
  updateState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }
}
