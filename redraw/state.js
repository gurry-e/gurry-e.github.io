export class State {
  constructor(name, color, counties = []) {
    this.name = name;
    this.color = color;
    this.counties = counties;
  }

  addCounty(county) {
    this.counties.push(county);
    county.updateState(this.name);
  }

  removeCounty(county) {
    if (this.counties.includes(county)) {
      this.counties.splice(this.counties.indexOf(county), 1);
    }
  }

  rename(name) {
    this.name = name;
    for (var county in this.counties) {
      this.counties[county].updateState(name);
    }
  }

  setColor(color) {
    this.color = color;
  }
}
