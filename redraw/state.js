export class State {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.counties = [];
  }

  addCounty(county) {
    this.counties.push(county);
    county.updateState(this);
  }

  removeCounty(county) {
    if (this.counties.includes(county)) {
      this.counties.splice(this.counties.indexOf(county), 1);
    }
  }

  setColor(color) {
    this.color = color;
  }
}
