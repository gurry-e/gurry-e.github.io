export class County {
  constructor(id, name) {
    this.meta = {
      id: id,
      name: name
    };
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
}
