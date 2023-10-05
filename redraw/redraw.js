import { County } from "./county.js";
import { State } from "./state.js";

const LMSG_ON = false; // display loading messages when loading page

var unassigned = new State("Unassigned","000000"); // state containing unassigned counties
var full_county_data = {};
var new_states = {};
new_states["Unassigned"] = unassigned;
var hoverMode = false; // select counties by hovering over them rather than clicking
var mapReady = false;
var dataReady = false;
var loadModal;
var usMap;
var usMapN;
var datas = {
  "ACS_14_5YR/age_and_sex_data.csv": undefined,
  "ACS_14_5YR/education_data.csv": undefined,
  "ACS_14_5YR/employment_data.csv": undefined,
  "ACS_14_5YR/food_stamps_data.csv": undefined,
  "ACS_14_5YR/households_data.csv": undefined,
  "ACS_14_5YR/income_data.csv": undefined,
  "ACS_14_5YR/language_data.csv": undefined,
  "ACS_14_5YR/marital_status_data.csv": undefined,
  "ACS_14_5YR/race_data.csv": undefined,
  "ACS_14_5YR/school_enrollment_data.csv": undefined,
  "us16.12.csv": undefined,
};

var svg = d3.select("svg");
var g = svg.append("g");
svg.on("click", function() {
  if (d3.event.defaultPrevented) {
    d3.event.stopPropagation();
  }
}, true);
svg.call(d3.zoom().scaleExtent([1, 32]).on("zoom", function() {
  g.attr("transform", d3.event.transform);
}));

var path = d3.geoPath();

/* UTILITY */

/**
 * Remove a given element from an array
 * @param {Array<T>} arr array
 * @param {T} e element to be removed
 */
function removeFromArray(arr, e) {
  arr.splice(arr.indexOf(e), 1);
}

function round(num, places) {
  var multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
}

function roundPct(num, places) {
  return round(num * 100, places);
}

function ned(type) {
  return document.createElement(type);
}

function showModal(modalContent) {
  document.body.appendChild(modalContent.parentElement);
  modalContent.parentElement.style.display = 'block';
}

/* MODAL */

function disposeModal(modalContent) {
  document.body.removeChild(modalContent.parentElement);
  reload();
}

function createModal() {
  var modal = ned("div");
  modal.className = "modal";
  var content = modal.appendChild(ned("div"));
  content.className = "modalContent";

  var btn = content.appendChild(ned("span"));
  btn.className = "fakeBtn close";
  btn.innerHTML = "&times;";
  btn.onclick = function() {
    disposeModal(content);
  }

  return modal;
}

function assignCounty(county, state) {
  state = new_states[state];
  county.getState().removeCounty(county);
  state.addCounty(county);
  reload();
}

function gsci(county) {
  for (var sid in new_states) {
    var state = new_states[sid];
    if (state.counties.includes(county)) {
      return sid;
    }
  }
  console.error("gsci: no state found for " + county);
}

/**
 * Transfer data from an existing state to a new state, deleting the old state
 * @param {*} oldName existing state name
 * @param {*} newName name of new state
 * @param {*} newColor new state color
 */
function configState(oldName, newName, newColor) {
  var temp = new_states[oldName];
  delete new_states[oldName];
  new_states[newName] = temp;
  new_states[newName].setColor(newColor);
  reload();
}

function fvor(name) {
  var radios = document.getElementsByName(name);
  for (var r in radios) {
    var radio = radios[r];
    if (radio.checked) {
      return radio.value;
    }
  }
  return undefined;
}

function reloadJscolor() {
  jscolor.installByClassName("jscolor");
}

function reloadStateList() {
  var stateList = d3.select("#stateList").node();
  var selectedState = fvor("state");
  if (selectedState === undefined) {
    selectedState = "Unassigned";
  }
  stateList.innerHTML = '';
  var colLeft = stateList.appendChild(ned("div"));
  colLeft.style.height = "125px";
  colLeft.style.overflow = "auto";
  colLeft.className = "column left";
  var colRight = stateList.appendChild(ned("div"));
  colRight.className = "column right";
  var colNum = 0;
  for (var name in new_states) {
    colNum++;
    var state = new_states[name];
    var nedt = (colNum % 2 !== 0) ? colLeft : colRight;
    var p = nedt.appendChild(ned("p"));
    var radio = p.appendChild(ned("input"));
    radio.type = "radio";
    radio.name = "state";
    radio.value = name;
    radio.onclick = function() {
      selectedState = this.value;
      var s = aggregateState(new_states[this.value]);
      d3.select("#statePop").html("Population: ").append("b").html(s.population.total.toLocaleString());
      var politicsTable = d3.select("#statePolitics").select("tbody");
      politicsTable.html('');
      var e16 = politicsTable.append("tr");
      e16.append("td").html('2016 Presidential Election');
      if (s.politics.presidential2016.dem > s.politics.presidential2016.gop) {
        e16.append("td").style("color", "darkblue").html("Clinton +" + s.politics.presidential2016.margin * -1);
      } else {
        e16.append("td").style("color", "darkred").html("Trump +" + s.politics.presidential2016.margin);
      }
      e16 = politicsTable.append('tr');
      e16.append("td").html("2012 Presidential Election");
      if (s.politics.presidential2012.dem > s.politics.presidential2012.gop) {
        e16.append("td").style("color", "darkblue").html("Obama +" + s.politics.presidential2012.margin * -1);
      } else {
        e16.append("td").style("color", "darkred").html("Romney +" + s.politics.presidential2012.margin);
      }
      e16 = politicsTable.append("tr");
      e16.append("td").html("");
      s.politics.swing = round(s.politics.swing, 2);
      if (s.politics.swing < 0) {
        e16.append("td").style("color", "darkblue").html("D +" + s.politics.swing * -1 + " Swing");
      } else if (s.politics.swing > 0) {
        e16.append("td").style("color", "darkred").html("R +" + s.politics.swing + " Swing");
      } else {
        e16.append("td").style("color", "black").html("  +" + s.politics.swing + " Swing");
      }
      e16 = politicsTable.append("tr");
      e16.append("td").html("");
      s.politics.pvi = round(s.politics.pvi, 2);
      if (s.politics.pvi < 0) {
        e16.append("td").style("color", "darkblue").html("D +" + s.politics.pvi * -1 + " PVI");
      } else if (s.politics.pvi > 0) {
        e16.append("td").style("color", "darkred").html("R +" + s.politics.pvi + " PVI");
      } else {
        e16.append("td").style("color", "black").html("  +" + s.politics.pvi + " PVI");
      }
    }
    if (name == selectedState) {
      radio.onclick();
      d3.select(radio).attr("checked", name == selectedState);
    }
    var staten = p.appendChild(ned("span"));
    staten.innerHTML = name;
    /*staten.onclick = function() {
      radio.onclick();
      d3.select(radio).attr("checked", name == selectedState);
    }*/
    p.appendChild(ned("br"));
    var input = p.appendChild(ned("input"));
    input.className = "jscolor";
    input.value = state.color;
    var me2 = d3.select(input);
    me2.attr("state", name);
    d3.select(input).on("change", function() {
      var me3 = d3.select(this);
      new_states[me3.attr("state")].setColor("#" + me3.node().value);
      reload();
    });
  }
}

function aggregateState(state) {
  var agg = {
    population: {
      total: 0
    },
    politics: {
      presidential2012: {
        total: 0,
        dem: 0,
        gop: 0,
        margin: 0
      },
      presidential2016: {
        total: 0,
        dem: 0,
        gop: 0,
        margin: 0
      },
      swing: 0,
      pvi: 0
    }
  };
  var p2012 = agg.politics.presidential2012;
  var p2016 = agg.politics.presidential2016;
  
  for (var county in state.counties) {
    county = state.counties[county];
    console.log(county);
    var county2012 = county.politics.presidential2012;
    var county2016 = county.politics.presidential2016;

    agg.population.total += county.population.total;

    if (county.meta.name.includes("Alaska")
     || county.meta.name.includes("Kalawao")) {
      continue;
    }

    p2012.total += county2012.total;
    p2012.dem += county2012.dem;
    p2012.gop += county2012.gop;
    p2016.total += county2016.total;
    p2016.dem += county2016.dem;
    p2016.gop += county2016.gop;

    if (isNaN(p2016.dem)) {
      console.log(state.counties[county]);
      return;
    }
  }

  p2016.margin = roundPct((p2016.gop - p2016.dem) / p2016.total, 2);
  p2012.margin = roundPct((p2012.gop - p2012.dem) / p2012.total, 2);
  agg.politics.swing = p2016.margin - p2012.margin;
  agg.politics.pvi = ((p2016.margin + p2012.margin) / 2) + 1.89;

  return agg;
}

function reloadMap() {
  for (var name in new_states) {
    for (var i in new_states[name].counties) {
      var countyId = new_states[name].counties[i];
      d3.select("path#" + countyId).attr("fill", new_states[name].color);
      if (name !== "Unassigned") {
        if (!d3.select("#showCounties").node().checked) {
          d3.select("path#" + countyId).style("strokeWidth", "0.5px");
          d3.select("path#" + countyId).style("stroke", "#" + new_states[name].color);
        }
      }
    }
  }
}

function reload() {
  reloadStateList();
  reloadMap();
  reloadJscolor();
}

/*** Handle Events ***/

/* New State */
d3.select("button#newState").on("click", function() {
  var modal = createModal().querySelector(".modalContent");

  var p1 = modal.appendChild(ned("p"));
  p1.innerHTML = "State Name: ";
  var name = p1.appendChild(ned("input"));

  var p2 = modal.appendChild(ned("p"));
  p2.innerHTML = "Color: ";
  var color = p2.appendChild(ned("input"));
  color.className = "jscolor";
  color.type = "jscolor";

  var btn = modal.appendChild(ned("button"));
  btn.innerHTML = "Create State";
  btn.onclick = function() {
    new_states[name.value] = new State(name.value, "#" + color.value);
    reload();
    disposeModal(modal);
  }

  showModal(modal);
  name.focus();

  reloadJscolor();
});

/* Rename State */
d3.select("button#renameState").on("click", function() {
  var selectedState = fvor("state");
  if (selectedState != "Unassigned") {
    var modal = createModal().querySelector(".modalContent");

    var p = modal.appendChild(ned("p"));
    p.innerHTML = "State Name: ";

    var nameInput = p.appendChild(ned("input"));
    d3.select(nameInput).attr("placeholder", selectedState);

    var btn = modal.appendChild(ned("button"));
    btn.innerHTML = "Rename State";
    btn.onclick = function() {
      configState(selectedState, nameInput.value, new_states[selectedState].color);
      disposeModal(modal);
    }

    showModal(modal);
  }
});

/* Save Map */
d3.select("#compressor").on("click", function() {
  var modal = createModal().querySelector(".modalContent");
  modal.appendChild(ned("p")).innerHTML = ("Please save the following string:");
  modal.appendChild(ned("p")).innerHTML = btoa(JSON.stringify(new_states));
  document.body.appendChild(modal.parentElement);
  modal.parentElement.style.display = 'block';
});

/* Load Map */
d3.select("#decompressor").on("click", function() {
  var modal = createModal().querySelector(".modalContent");
  modal.appendChild(ned("p")).innerHTML = ("Enter your saved data: ");
  var tx = modal.appendChild(ned("textarea"));
  tx.style.width = "100%";
  tx.style.height = "100%";
  var btn = modal.appendChild(ned("button"));
  btn.innerHTML = "Load Map";
  document.body.appendChild(modal.parentElement);
  modal.parentElement.style.display = 'block';
  btn.onclick = function() {
    disposeModal(modal);
    new_states = JSON.parse(atob(tx.value));
    reload();
  };
});

/* Assign State */
d3.select("#assignState").on("click", function() {
  console.log("...");
  var modal = createModal().querySelector(".modalContent");
  modal.appendChild(ned("p")).innerHTML = ("Old State: ");
  var input = modal.appendChild(ned("input"));
  modal.appendChild(ned("p")).innerHTML = "New State: ";
  var input2 = modal.appendChild(ned("input"));

  input.style.width = "100%";
  input2.style.width = "100%";

  var btn = modal.appendChild(ned("button"));
  btn.innerHTML = "Assign";

  document.body.appendChild(modal.parentElement);
  modal.parentElement.style.display = 'block';
  btn.onclick = function() {
    disposeModal(modal);
    for (var id in full_county_data) {
      var fcd = full_county_data[id];
      if (fcd.meta.name.endsWith(input.value)) {
        assignCounty(fcd, input2.value);
      }
    }
    reload();
  };
});

/* Show County Borders */
d3.select("#showCounties").on("change", function() {
  var me = d3.select(this).node();
  var paths = document.getElementsByClassName("countyBorders");
  if (me.checked) {
    for (var p in paths) {
      var path = paths[p];
      if (typeof(path) != "object") {
        continue;
      }
      path.style.stroke = "#BBBBBB";
      path.style.strokeWidth = "0.2px";
    }
    d3.selectAll("path.county").each(function(d) {
      var me2 = d3.select(this);

      me2.node().style = '';
    });
  } else {
    for (var p in paths) {
      var path = paths[p];
      if (typeof(path) != "object") {
        continue;
      }
      path.style.stroke = "#000000";
      path.style.strokeWidth = "0px";
    }
    d3.selectAll("path.county").each(function(d) {
      var me2 = d3.select(this);
      //var state = new_states[gsci("US" + d.id)]

      me2.style("strokeWidth", "1px");
      me2.style("stroke", "#" + new_states[gsci("US" + d.id)].color);
    });
  }
});

/* Show State Borders */
d3.select("#showStates").on("change", function() {
  var me = d3.select(this).node();
  var paths = document.getElementsByClassName("stateBorders");
  if (me.checked) {
    for (var p in paths) {
      var path = paths[p];
      /*if (typeof(path) != "object") {
        continue;
      }*/
      path.style.stroke = "#CCCCCC";
      path.style.strokeWidth = "0.6px";
    }
    d3.selectAll("path.state").each(function(d) {
      d3.select(this).node().style = '';
    });
  } else {
    for (var p in paths) {
      var path = paths[p];
      /*if (typeof(path) != "object") {
        continue;
      }*/
      path.style.stroke = "#000000";
      path.style.strokeWidth = "0px";
    }
  }
});

d3.select("#countyColor").on("change", function() {
  var value = fvor("cc");
  var key = d3.select("#mapKey");
  var table = key.select("table");
  var thead = table.select("thead").node();
  thead.innerHTML = '';
  var tbody = table.select("tbody").node();
  tbody.innerHTML = '';
  if (value == "nc") {
    key.style("display", "none");
  }
  else if (value == "race") {
    key.style("display", "block");
    var trh = thead.appendChild(ned("tr"));
    trh.appendChild(ned("th")).innerHTML = "Race";
    trh.appendChild(ned("th")).innerHTML = "Color";
  }
});

d3.select("body").on("keypress", function(ev) {
  if (d3.event.keyCode == 108) {
    var modal = createModal().querySelector(".modalContent");

    var state_values = modal.appendChild(ned("textarea"));
    state_values.style.width = "100%";
    state_values.placeholder = "State Values";
    var color_values = modal.appendChild(ned("textarea"));
    color_values.style.width = "100%";
    color_values.placeholder = "Color Values";

    var btn = modal.appendChild(ned("button"));
    btn.innerHTML = "Load Values";
    btn.onclick = function() {
      var smol = JSON.parse(atob(state_values.value));
      var smol_color = JSON.parse(atob(color_values.value));
      new_states = {};
      for (var s in smol) {
        new_states[s] = {};
        new_states[s].color = "#" + smol_color[s];
        new_states[s].counties = [];
        for (var i = 0; i < smol[s].length; i++) {
          new_states[s].counties.push(smol[s][i]);
        }
      }
      document.body.removeChild(modal.parentElement);
      reload();
    };

    // document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block';

  } else if (d3.event.keyCode == 47) {
    hoverMode = !hoverMode;
    console.log("Hover Mode: " + hoverMode);
  }
});

/*** DATA FUNCTIONS ***/

function craftXHR(d) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/' + d, true);
  lmsg("Loading " + d + "...");

  xhr.onload = function(e) {
    if (!this.status == 200) {
      lmsg("An error occured loading " + d);
      lmsg("Status code: " + this.status);
      return;
    }

    var data = d3.csvParse(this.response);
    lmsg(d + " loaded!");
    datas[d] = data;
    for (var i in datas) {
      if (datas[i] == undefined) {
        return;
      }
    }

    processCensusData();
  }

  xhr.send();
}

function processCensusData() {
  lmsg("Processing data...");

  processAgeSex(datas["ACS_14_5YR/age_and_sex_data.csv"]);
  processEducationalAttainment(datas["ACS_14_5YR/education_data.csv"]);
  processEmploymentStatus(datas["ACS_14_5YR/employment_data.csv"]);
  processPoverty(datas["ACS_14_5YR/food_stamps_data.csv"]);
  processHouseholds(datas["ACS_14_5YR/households_data.csv"]);
  processIncome(datas["ACS_14_5YR/income_data.csv"]);
  processLanguage(datas["ACS_14_5YR/language_data.csv"]);
  processMaritalStatus(datas["ACS_14_5YR/marital_status_data.csv"]);
  processRace(datas["ACS_14_5YR/race_data.csv"]);
  processSchoolEnrollment(datas["ACS_14_5YR/school_enrollment_data.csv"]);
  processPolitics(datas["us16.12.csv"]);

  lmsg("Data processed!");
  // some counties have been renamed, this keeps them consistent
  // shannon county, south dakota was renamed ogala lakota county and assigned new code
  full_county_data.US46102 = full_county_data.US46113;
  full_county_data.US46102.meta.name = "Ogala Lakota County, South Dakota";

  // wade hampton census area, alaska is now kuslivak census area, alaska
  full_county_data.US02158 = full_county_data.US02270;
  full_county_data.US02158.meta.name = "Kusilvak Census Area, Alaska";
  dataReady = true;
  checkAndCloseLoad();
}

function aggregate(arr, pct = false, population = 0, places = 0) {
  var res = 0;
  if (pct) {
    for (var i in arr) {
      res += Number(arr[i]);
    }
    return round(res / 100 * population, places);
  }
  else {
    for (var i in arr) {
      res += Number(arr[i]);
    }
    return round(res, places);
  }
}

function getCountyData(county) {
  if (full_county_data["US" + county["GEO.id2"]] == undefined) {
    full_county_data["US" + county["GEO.id2"]] = new County(county["GEO.id2"], county["GEO.display-label"], unassigned);
  }
  return full_county_data["US" + county["GEO.id2"]];
}

function processRace(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var fcd = getCountyData(county);

    fcd.population.general.race.white = NaN;
  }
}

function processPolitics(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var politics = getCountyData(county).politics;
    var p2016 = politics.presidential2016;
    var p2012 = politics.presidential2012;

    p2016.total = Number(county["total_votes_2016"]);
    p2016.dem = Number(county["votes_dem_2016"]);
    p2016.gop = Number(county["votes_gop_2016"]);
    p2016.demPct = roundPct(p2016.dem / p2016.total, 2);
    p2016.gopPct = roundPct(p2016.gop / p2016.total, 2);
    p2016.margin = round(p2016.gopPct - p2016.demPct, 2);

    p2012.total = Number(county["total_votes_2012"]);
    p2012.dem = Number(county["votes_dem_2012"]);
    p2012.gop = Number(county["votes_gop_2012"]);
    p2012.demPct = roundPct(p2012.dem / p2012.total, 2);
    p2012.gopPct = roundPct(p2012.gop / p2012.total, 2);
    p2012.margin = round(p2012.gopPct - p2012.demPct, 2);

    politics.swing = p2016.margin - p2012.margin;
    politics.pvi = round((p2012.margin + p2016.margin) / 2, 2) + 1.89;

    if (isNaN(politics.swing)) {
      politics.swing = 0;
    }
    if (isNaN(politics.pvi)) {
      politics.pvi = p2016.margin + 1.89;
    }
  }
}

function processIncome(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var households = getCountyData(county).population.households;

    households.income.low = aggregate(
      [county["HC01_EST_VC02"], county["HC01_EST_VC03"], county["HC01_EST_VC04"]],
      true, households.total);
    households.income.lomid = aggregate(
      [county["HC01_EST_VC02"], county["HC01_EST_VC05"], county["HC01_EST_VC06"], county["HC01_EST_VC07"]],
      true, households.total);
    households.income.himid = aggregate(
      [county["HC01_EST_VC02"], county["HC01_EST_VC08"], county["HC01_EST_VC09"]],
      true, households.total);
    households.income.high = aggregate(
      [county["HC01_EST_VC02"], county["HC01_EST_VC10"], county["HC01_EST_VC11"]],
      true, households.total);
    households.income.median = Number(county["HC01_EST_VC13"]);
  }
}

function processHouseholds(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var types = getCountyData(county).population.households.status.types;

    types.married = Number(county["HC02_EST_VC02"]);
    types.singleParent = aggregate([county["HC03_EST_VC02"], county["HC04_EST_VC02"]], false);
    types.nonfamily = Number(county["HC05_EST_VC02"]);
  }
}

function processPoverty(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var fcd = getCountyData(county);

    fcd.population.households.total = Number(county["HC01_EST_VC01"]);
    var foodStamps = fcd.population.households.status.poverty.foodStamps;
    foodStamps.receiving = Number(county["HC02_EST_VC01"]);
    foodStamps.notReceiving = Number(county["HC03_EST_VC01"]);
    foodStamps.receivingWithDependents = aggregate(
      [county["HC02_EST_VC02"], county["HC02_EST_VC03"]],
      false, fcd.population.households.total);
  }
}

function processEmploymentStatus(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var employment = getCountyData(county).population.general.employment;

    employment.workingAge = Number(county["HC01_EST_VC01"]);
    employment.laborForce = aggregate([county["HC02_EST_VC01"]], true, employment.workingAge);
    employment.employed = aggregate([county["HC03_EST_VC01"]], true, employment.workingAge);
    employment.unemployed = aggregate([county["HC04_EST_VC01"]], true, employment.workingAge);
    employment.notInLaborForce = employment.workingAge - employment.laborForce;
  }
}

function processEducationalAttainment(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var fcd = getCountyData(county);

    var attainment = fcd.population.education.attainment;
    attainment.lessHighschool = Number(county["HC01_EST_VC02"]) / 100 * fcd.population.total;
    attainment.highschool = Number(county["HC01_EST_VC03"]) / 100 * fcd.population.total;
    attainment.someCollege = aggregate([
      county["HC01_EST_VC04"]
    ], true, fcd.population.total);
    attainment.collegeDegree = aggregate([county["HC01_EST_VC05"]], true, fcd.population.total);
  }
}

function processAgeSex(dataset) {
  for (var i = 1; i < dataset.length; i++) {
    var county = dataset[i];
    var fcd = getCountyData(county);
    var sex = fcd.population.general.sex;
    var age = fcd.population.general.age;

    fcd.population.total = Number(county["HC01_EST_VC01"]);
    sex.male = Number(county["HC02_EST_VC01"]);
    sex.female = Number(county["HC03_EST_VC01"]);
    age.children = aggregate(
      [county["HC01_EST_VC03"], county["HC01_EST_VC04"]],
      true, fcd.population.total);
    age.teenagers = aggregate(
      [county["HC01_EST_VC05"], county["HC01_EST_VC06"]],
      true, fcd.population.total);
    age.youngAdults = aggregate(
      [county["HC01_EST_VC07"], county["HC01_EST_VC08"], county["HC01_EST_VC09"], county["HC01_EST_VC10"]],
      true, fcd.population.total);
    age.adults = aggregate(
      [county["HC01_EST_VC11"], county["HC01_EST_VC12"], county["HC01_EST_VC13"], county["HC01_EST_VC14"]],
      true, fcd.population.total);
    age.oldAdults = aggregate(
      [county["HC01_EST_VC15"], county["HC01_EST_VC16"], county["HC01_EST_VC17"], county["HC01_EST_VC18"]],
      true, fcd.population.total);
    age.seniors = aggregate(
      [county["HC01_EST_VC19"], county["HC01_EST_VC20"]],
      true, fcd.population.total);
  }
}

function processLanguage(dataset) {
  console.error("Language processing not implemented!");
}

function processMaritalStatus(dataset) {
  console.error("Marital Status processing not implemented!");
}

function processSchoolEnrollment(dataset) {
  console.error("School Enrollment processing not implemented!");
}

/*** GET DATA ***/

function lmsg(txt) {
  console.log(txt);
  if (LMSG_ON) {
    loadModal.appendChild(ned("p")).innerHTML = txt;
  }
}

function checkAndCloseLoad() {
  if (mapReady && dataReady) {
    if (LMSG_ON) {
      disposeModal(loadModal);
    } else {
      reload();
    }
  }
}

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  usMap = topojson.feature(us, us.objects.counties);
  usMapN = topojson.neighbors(us.objects.counties.geometries);

  usMap.features.forEach(function(county, i) {
    county.distance = Infinity;
    county.neighbors = usMapN[i].map(function(j) { return usMap.features[j]; });
  });

  lmsg("Drawing map...");

  g.attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("d", path)
    .attr("id", function(d) {
      new_states["Unassigned"].counties.push("US" + d.id);
      return "US" + d.id;
    })
    .attr("class", "county")
    .on("click", function(d) {
      console.log(d.id);
      var radios = document.getElementsByName("state");
      for (var i = 0; i < radios.length; i++) {
        var r = radios[i];
        if (r.checked) {
          assignCounty(full_county_data["US" + d.id], r.value);
          reload();
          break;
        }
      }
    })
    .on("mouseenter", function(d) {
      if (hoverMode) {
        console.log(d.id);
        var radios = document.getElementsByName("state");
        for (var i = 0; i < radios.length; i++) {
          var r = radios[i];
          if (r.checked) {
            assignCounty(full_county_data["US" + d.id], r.value);
            reload();
            break;
          }
        }
      } else {
        tooltip.transition().duration(100).style("opacity", .9);

        var fcd = full_county_data["US" + d.id];
        tooltip.append("span").html(fcd.meta.name).append("br").append("br");
        tooltip.append("span").append("b").html(gsci("US" + fcd.meta.id)).append("br");
        if (d3.select("#popToggle").node().checked) {
          tooltip.append("span").html("Population: ") // County Population
                 .append("b").html(fcd.population.total.toLocaleString()).append("br");
        }
        if (d3.select("#pviToggle").node().checked) {
          tooltip.append("span").html("PVI: ") // County PVI
                 .append("b").html(fcd.politics.pvi.toLocaleString()).append("br");
        }
        if (d3.select("#medIncomeToggle").node().checked) {
          tooltip.append("span").html("Median Household Income: ") // County Median Household Income
                 .append("b").html('$' + fcd.population.households.income.median.toLocaleString()).append("br");
        }
        tooltip.append("span").html("College Educated: ")
               .append("b").html(fcd.population.education.attainment.collegeDegree.toLocaleString()).append("br");

        tooltip.style("left", (d3.event.pageX + 16) + "px")
               .style("top", (d3.event.pageY - 16) + "px");
      }
    })
    .on("mouseout", function(d) {
      tooltip.transition().duration(500).style("opacity", 0);
      tooltip.html('');
    });

  g.append("path")
    .attr("class", "countyBorders")
    .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })));

  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "stateBorders")
    .attr("d", path);

  mapReady = true;
  checkAndCloseLoad();
  lmsg("Map drawn!");
});

function aiGen(no_states = 50, derv = 0.50) {
  for (var id in usMap.features) {
    var mapCounty = usMap.features[id];
    if (full_county_data["US" + mapCounty.id] === undefined) {
      console.log(mapCounty.id);
    }
    full_county_data["US" + mapCounty.id].neighbors = [];
    for (var i in mapCounty.neighbors) {
      full_county_data["US" + mapCounty.id].neighbors.push("US" + mapCounty.neighbors[i].id);
    }
  }

  // link alaska to washington
  full_county_data.US53055.neighbors.push("US02198");
  full_county_data.US02198.neighbors.push("US53055");
  // link hawaii to california
  full_county_data.US06025.neighbors.push("US15001");
  full_county_data.US15001.neighbors.push("US06025");

  var os = {
    "State 1": {
      population: 0,
      counties: []
    },
  };
  var cs = "State 1";
  var csi = 1;

  console.log("Beginning alogrithmic state generation");
  var counties = new_states["Unassigned"].counties;
  console.log((counties).length + " counties to assign into " + no_states + " states");
  console.log("permitted population dervication: " + (derv * 100) + "%");
  var pps = round(aggregateState(new_states["Unassigned"]).population.total / no_states, 0);
  var lpps = round(pps - pps * derv, 0);
  var upps = round(pps + pps * derv, 0);
  console.log("Population Per State: " + pps.toLocaleString());
  console.log("\tLowerbound: " + lpps.toLocaleString());
  console.log("\tUpperbound: " + upps.toLocaleString());

  var touched = [];
  var ntt = counties.length;
  while (touched.length !== ntt) {
    for (var countyNum in counties) {
      var county = full_county_data[counties[countyNum]];
      var id = "US" + county.meta.id;
      if (touched.includes(id)) {
        continue;
      }
      touched.push(id);
      console.log("considering: " + county.meta.name);
      if (os[cs].population + county.population.total < upps) {
        touched.push("US" + county.meta.id);
        os[cs].counties.push("US" + county.meta.id);
        console.log("Added " + county.meta.name + " to " + cs);
      } else if (os[cs].population > lpps) {
        console.log("Complete state: " + cs);
        csi++;
        cs = "State " + csi;
        os[cs] = {
          population: 0,
          counties: []
        };
      }
    }
  }

  return {
    generatedStates: os,
    touchedCounties: touched
  };
}

if (LMSG_ON) {
  loadModal = createModal().querySelector(".modalContent");
  loadModal.parentElement.style.display = 'block';
  document.body.appendChild(loadModal.parentElement);
  console.log(loadModal.querySelector("span.fakeBtn"));
  loadModal.removeChild(loadModal.querySelector("span.fakeBtn"));
}

/* Fetch census/political data */
lmsg("Downloading data...");
for (var i in datas) {
  craftXHR(i);
}

reload();
