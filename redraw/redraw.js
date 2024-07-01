import { County } from "./county.js";
import { State } from "./state.js";
//import dataFiles from "./data.json" assert {type: "json"};
//import existingStates from "./existing_states.json" assert {type: "json"};

var dataFiles = {
  "ageAndSex": {
    "name": "age_and_sex",
    "filePath": "ACS_14_5YR/age_and_sex_data.csv",
    "statistics": {
      "totalPopulation": "HC01_EST_VC01",
      "medianAge": "HC01_EST_VC35",
      "ageDependencyRatio": "HC01_EST_VC37"
    },
    "data": []
  },
  "education": {
    "name": "education",
    "filePath": "ACS_14_5YR/education_data.csv",
    "statistics": {
      "percentHSGradOrHigher": "HC01_EST_VC16",
      "percentBachelorsOrHigher": "HC01_EST_VC17"
    },
    "data": []
  },
  "employment": {
    "name": "employment",
    "filePath": "ACS_14_5YR/employment_data.csv",
    "statistics": {},
    "data": []
  },
  "income": {
    "name": "income",
    "filePath": "ACS_14_5YR/income_data.csv",
    "statistics": {
      "medianIncome": "HC01_EST_VC13",
      "meanIncome": "HC01_EST_VC15"
    },
    "data": []
  },
  "language": {
    "name": "language",
    "filePath": "ACS_14_5YR/language_data.csv",
    "statistics": {},
    "data": []
  },
  "maritalStatus": {
    "name": "marital_status",
    "filePath": "ACS_14_5YR/marital_status_data.csv",
    "statistics": {},
    "data": []
  },
  "race": {
    "name": "race",
    "filePath": "ACS_14_5YR/race_data.csv",
    "statistics": {
      "white": "HD01_VD02",
      "black": "HD01_VD03",
      "nativeAmerican": "HD01_VD04",
      "asian": "HD01_VD05",
      "pacificIslander": "HD01_VD06",
      "other": "HD01_VD07",
      "mixed": "HD01_VD08"
    },
    "data": []
  },
  "schoolEnrollment": {
    "name": "school_enrollment",
    "filePath": "ACS_14_5YR/school_enrollment_data.csv",
    "statistics": {},
    "data": []
  },
  "politics": {
    "name": "politics",
    "filePath": "us16.12.csv",
    "statistics": {
      "votesDem2016": "votes_dem_2016",
      "votesGop2016": "votes_gop_2016",
      "votes2016": "total_votes_2016",
      "percentDem2016": "per_dem_2016",
      "percentGop2016": "per_gop_2016",
      "percentDiff2016": "per_point_diff_2016",
      "votesDem2012": "votes_dem_2012",
      "votesGop2012": "votes_gop_2012",
      "votes2012": "total_votes_2012",
      "percentDem2012": "per_dem_2012",
      "percentGop2012": "per_gop_2012",
      "percentDiff2012": "per_point_diff_2012"
    },
    "data": []
  }
}

var existingStates = {
  "Alabama": {
    "color": "red"
  },
  "Alaska": {
    "color": "pink"
  },
  "Arizona": {
    "color": "yellow"
  },
  "Arkansas": {
    "color": "red"
  },
  "California": {
    "color": "green"
  },
  "Colorado": {
    "color": "green"
  },
  "Connecticut": {
    "color": "green"
  },
  "Delaware": {
    "color": "red"
  },
  "Florida": {
    "color": "pink"
  },
  "Georgia": {
    "color": "green"
  },
  "Hawaii": {
    "color": "yellow"
  },
  "Idaho": {
    "color": "green"
  },
  "Illinois": {
    "color": "red"
  },
  "Indiana": {
    "color": "pink"
  },
  "Iowa": {
    "color": "green"
  },
  "Kansas": {
    "color": "red"
  },
  "Kentucky": {
    "color": "green"
  },
  "Louisiana": {
    "color": "yellow"
  },
  "Maine": {
    "color": "pink"
  },
  "Maryland": {
    "color": "pink"
  },
  "Massachusetts": {
    "color": "red"
  },
  "Michigan": {
    "color": "green"
  },
  "Minnesota": {
    "color": "red"
  },
  "Mississippi": {
    "color": "pink"
  },
  "Missouri": {
    "color": "pink"
  },
  "Montana": {
    "color": "yellow"
  },
  "Nebraska": {
    "color": "yellow"
  },
  "Nevada": {
    "color": "red"
  },
  "New Hampshire": {
    "color": "yellow"
  },
  "New Jersey": {
    "color": "yellow"
  },
  "New Mexico": {
    "color": "red"
  },
  "New York": {
    "color": "pink"
  },
  "North Carolina": {
    "color": "pink"
  },
  "North Dakota": {
    "color": "green"
  },
  "Ohio": {
    "color": "red"
  },
  "Oklahoma": {
    "color": "yellow"
  },
  "Oregon": {
    "color": "pink"
  },
  "Pennsylvania": {
    "color": "green"
  },
  "Rhode Island": {
    "color": "pink"
  },
  "South Carolina": {
    "color": "red"
  },
  "South Dakota": {
    "color": "pink"
  },
  "Tennessee": {
    "color": "yellow"
  },
  "Texas": {
    "color": "green"
  },
  "Utah": {
    "color": "pink"
  },
  "Vermont": {
    "color": "green"
  },
  "Virginia": {
    "color": "red"
  },
  "Washington": {
    "color": "red"
  },
  "West Virginia": {
    "color": "yellow"
  },
  "Wisconsin": {
    "color": "yellow"
  },
  "Wyoming": {
    "color": "red"
  }
}

const ZOOM_TYPE = 0
const PVI_SHIFT = -1.89

var unassigned = new State("Unassigned", "#D1DBDD");
var countiesByID = {};
var statesByName = {"Unassigned": unassigned};
var zoom = 1;
var hoverMode = false; // select counties by hovering over them rather than clicking
var mapReady = false;
var dataReady = false;
var usMap;
var usMapN;

var content = d3.select("#content");
var map = d3.select("#map");
var svg = d3.select("svg");
var g = svg.append("g");
if (ZOOM_TYPE === 0) {
  map.on("click", function() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }, true);
  map.call(d3.zoom().scaleExtent([1, 32]).on("zoom", function() {
    g.attr("transform", d3.event.transform);
  }));  
} else {
  content.on("click", function() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }, true);
  content.node().addEventListener("mousedown", (event) => {
    // Get the mouse cursor position at startup
    let xPosn = event.clientX;
    let yPosn = event.clientY;
  
    // Call a function whenever the cursor moves
    content.node().onmousemove = function(e) {
      e.preventDefault();
      // Calculate the new cursor position
      let xDiff = xPosn - e.clientX;
      let yDiff = yPosn - e.clientY;
      xPosn = e.clientX;
      yPosn = e.clientY;
      // Set the element's new position
      map.node().style.top = (map.node().offsetTop - yDiff) + "px";
      map.node().style.left = (map.node().offsetLeft - xDiff) + "px";
    };
  
    content.node().onmouseup = function() {
      // Stop moving when mouse button is released
      content.node().onmouseup = null;
      content.node().onmousemove = null;
    };
  });
}

var path = d3.geoPath();

/* UTILITY */

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

function assignCounty(county, stateName) {
  if (statesByName[stateName] !== undefined) {
    var state = statesByName[stateName];
    statesByName[county.getState()].removeCounty(county);
    state.addCounty(county);
  }
}

function gsci(countyID) {
  for (var state in statesByName) {
    for (var county in statesByName[state].counties) {
      if (statesByName[state].counties[county].id == countyID) {
        return state;
      }
    }
  }
  console.error("gsci: no state found for " + countyID);
}

/**
 * Transfer data from an existing state to a new state, deleting the old state
 * @param {*} oldName existing state name
 * @param {*} newName name of new state
 * @param {*} newColor new state color
 */
function configState(oldName, newName, newColor) {
  statesByName[newName] = statesByName[oldName];
  statesByName[newName].rename(newName);
  statesByName[newName].setColor(newColor);
  delete statesByName[oldName];
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
  colLeft.style.overflow = "auto";
  colLeft.className = "column left";
  var colRight = stateList.appendChild(ned("div"));
  colRight.className = "column right";
  var colNum = 0;
  for (var name in statesByName) {
    colNum++;
    var state = statesByName[name];
    var nedt = (colNum % 2 !== 0) ? colLeft : colRight;
    var p = nedt.appendChild(ned("p"));
    var radio = p.appendChild(ned("input"));
    radio.type = "radio";
    radio.name = "state";
    radio.value = name;
    radio.onclick = function() {
      selectedState = this.value;
      var s = aggregateState(statesByName[this.value]);
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
      statesByName[me3.attr("state")].setColor("#" + me3.node().value);
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
  
  for (var countyID in state.counties) {
    var county = state.counties[countyID];
    if (!isNaN(county.getStatistic('age_and_sex', 'totalPopulation'))) {
      agg.population.total += county.getStatistic('age_and_sex', 'totalPopulation');
    }

    if (county.name !== undefined
    && (county.name.includes("Alaska")
     || county.name.includes("Kalawao"))) {
      continue;
    }

    p2012.total += county.getStatistic('politics', 'votes2012');
    p2012.dem += county.getStatistic('politics', 'votesDem2012');
    p2012.gop += county.getStatistic('politics', 'votesGop2012');
    p2016.total += county.getStatistic('politics', 'votes2016');
    p2016.dem += county.getStatistic('politics', 'votesDem2016');
    p2016.gop += county.getStatistic('politics', 'votesGop2016');
  }

  p2016.margin = roundPct((p2016.gop - p2016.dem) / p2016.total, 2);
  p2012.margin = roundPct((p2012.gop - p2012.dem) / p2012.total, 2);
  agg.politics.swing = p2016.margin - p2012.margin;
  agg.politics.pvi = ((p2016.margin + p2012.margin) / 2) - PVI_SHIFT;

  return agg;
}

function reloadMap() {
  for (var state in statesByName) {
    for (var county in statesByName[state].counties) {
      var countyId = statesByName[state].counties[county].id;
      d3.select("path#" + countyId).attr("fill", statesByName[state].color);
      if (state !== "Unassigned") {
        if (!d3.select("#showCounties").node().checked) {
          d3.select("path#" + countyId).style("strokeWidth", "0.5px");
          d3.select("path#" + countyId).style("stroke", "#" + statesByName[state].color);
        }
      }
    }
  }
}

function reload() {
  console.log(countiesByID)
  reloadStateList();
  reloadMap();
  reloadJscolor();
}

function setTransform() {
  g.attr("transform", "scale(" + zoom + ") translate(" + ((window.innerWidth - 999) / 2) + ", 0)");
}

/*** Handle Events ***/

/* Zoom In */
d3.select("#zoomIn").on("click", function() {
  zoom *= 1.1;
  setTransform();
});

/* Reset Positioning */
d3.select("#home").on("click", function() {
  zoom = 1;
  setTransform();
  map.node().style.top = "0px";
  map.node().style.left = "0px";
});

/* Zoom Out */
d3.select("#zoomOut").on("click", function() {
  zoom *= (1 / 1.1);
  setTransform();
});

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
    statesByName[name.value] = new State(name.value, "#" + color.value);
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
      configState(selectedState, nameInput.value, statesByName[selectedState].color);
      disposeModal(modal);
    }

    showModal(modal);
  }
});

/* Delete State */
d3.select("button#deleteState").on("click", function() {
  var selectedState = fvor("state");
  if (selectedState != "Unassigned") {
    while (statesByName[selectedState].counties.length > 0) {
      assignCounty(statesByName[selectedState].counties[0], "Unassigned");
    }
    delete statesByName[selectedState];
    reload();
  }
})

/* Download Map Configuration */
d3.select("#download").on("click", function() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(statesByName)));
  element.setAttribute('download', 'Redraw the States');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
});

/* Upload Map Configuration */
d3.select("#upload").on("click", function() {
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
    statesByName = JSON.parse(tx.value);
    reload();
  };
});

/* Assign State */
d3.select("#assignState").on("click", function() {
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
    for (var id in countiesByID) {
      var fcd = countiesByID[id];
      if (fcd.name.endsWith(input.value)) {
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
      path.style.strokeWidth = "0px";
    }
    d3.selectAll("path.county").each(function(d) {
      var me2 = d3.select(this);

      me2.style("strokeWidth", "1px");
      me2.style("stroke", "#" + statesByName[gsci("US" + d.id)].color);
    });
  }
});

/* Show State Borders */
d3.select("#showStates").on("change", function() {
  var me = d3.select(this).node();
  console.log(document);
  var paths = document.getElementsByClassName("stateBorders");
  if (me.checked) {
    for (var p in paths) {
      var path = paths[p];
      /*if (typeof(path) != "object") {
        continue;
      }*/
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

    var stateValues = modal.appendChild(ned("textarea"));
    stateValues.style.width = "100%";
    stateValues.placeholder = "State Values";
    var colorValues = modal.appendChild(ned("textarea"));
    colorValues.style.width = "100%";
    colorValues.placeholder = "Color Values";

    var btn = modal.appendChild(ned("button"));
    btn.innerHTML = "Load Values";
    btn.onclick = function() {
      var smol = JSON.parse(atob(stateValues.value));
      var smolColor = JSON.parse(atob(colorValues.value));
      statesByName = {};
      for (var s in smol) {
        statesByName[s] = {};
        statesByName[s].color = "#" + smolColor[s];
        statesByName[s].counties = [];
        for (var i = 0; i < smol[s].length; i++) {
          statesByName[s].counties.push(smol[s][i]);
        }
      }
      document.body.removeChild(modal.parentElement);
      reload();
    };

    // document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block';

  } else if (d3.event.key === "/") {
    hoverMode = !hoverMode;
  }
});

d3.select("#darkModeToggle").on("change", function() {
  if (d3.select("#darkModeToggle").node().checked) {
    d3.select("#mainContent").attr("class", "background dark");
    d3.select("#header").attr("class", "primary dark");
    d3.select("#zoomIn").attr("class", "zoomButton dark");
    d3.select("#home").attr("class", "zoomButton dark");
    d3.select("#zoomOut").attr("class", "zoomButton dark");
    d3.select("#left").attr("class", "column primary dark");
    d3.select("#middle").attr("class", "column secondary dark");
    d3.select("#stateList").attr("class", "row primary dark");
    d3.select("#newState").attr("class", "button dark");
    d3.select("#renameState").attr("class", "button dark");
    d3.select("#right").attr("class", "column primary dark");
    d3.select("#download").attr("class", "button dark");
    d3.select("#upload").attr("class", "button dark");
  } else {
    d3.select("#mainContent").attr("class", "background light");
    d3.select("#header").attr("class", "primary light");
    d3.select("#zoomIn").attr("class", "zoomButton light");
    d3.select("#home").attr("class", "zoomButton light");
    d3.select("#zoomOut").attr("class", "zoomButton light");
    d3.select("#left").attr("class", "column primary light");
    d3.select("#middle").attr("class", "column secondary light");
    d3.select("#stateList").attr("class", "row primary light");
    d3.select("#newState").attr("class", "button light");
    d3.select("#renameState").attr("class", "button light");
    d3.select("#right").attr("class", "column primary light");
    d3.select("#download").attr("class", "button light");
    d3.select("#upload").attr("class", "button light");
  }
});

/*** GET DATA ***/

function processCensusData() {
  for (var fileName in dataFiles) {
    file = dataFiles[fileName]
    for (var i = 1; i < file.data.length; i++) {
      var countyData = file.data[i];

      id = 'US' + countyData["GEO.id2"];
      if (countiesByID[id] == undefined) {
        countiesByID[id] = new County(id, countyData["GEO.display-label"], "Unassigned");
      } else if (countiesByID[id].name == undefined) {
        countiesByID[id].id = id;
        countiesByID[id].name = countyData["GEO.display-label"];
      }

      var county = countiesByID[id];
      
      county.addCategory(file.name);
      for (var statistic in file.statistics) {
        county.updateStatistic(file.name, statistic, Number(countyData[file.statistics[statistic]]));
      }
    }
  }

  for (var id in countiesByID) {
    var county = countiesByID[id];
    county.addCategory('politics');
    county.updateStatistic('politics', 'pvi', roundPct((county.getStatistic('politics', 'percentDiff2012') + county.getStatistic('politics', 'percentDiff2016')) / 2, 2) + PVI_SHIFT);
  }

  // some counties have been renamed, this keeps them consistent
  // shannon county, south dakota was renamed ogala lakota county and assigned new code
  countiesByID['US46113'].id = "US46102";
  countiesByID['US46113'].name = "Ogala Lakota County, South Dakota";
  countiesByID['US46102'].copy(countiesByID['US46113']);
  delete countiesByID['US46113'];

  // wade hampton census area, alaska is now kuslivak census area, alaska
  countiesByID['US02270'].id = "US02158";
  countiesByID['US02270'].name = "Kusilvak Census Area, Alaska";
  countiesByID['US02158'].copy(countiesByID['US02270']);
  delete countiesByID['US02270'];

  dataReady = true;
  if (mapReady) {
    reload();
  }
}

function craftXHR(file) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/' + dataFiles[file].filePath, true);

  xhr.onload = function() {
    if (!this.status == 200) {
      console.log("An error occured loading " + dataFiles[file].name);
      console.log("Status code: " + this.status);
      return;
    }

    var fileData = d3.csvParse(this.response);
    dataFiles[file].data = fileData;
    
    for (var i in dataFiles) {
      if (dataFiles[i].data.length === 0) {
        return;
      }
    }

    processCensusData();
    assignExistingStates();
  }

  xhr.send();
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

  g.attr("class", "counties")
  .attr("transform", "translate(" + ((window.innerWidth - 999) / 2) + ", 0)")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("d", path)
    .attr("id", function(d) {
      var newCounty = new County("US" + d.id, undefined, "Unassigned");
      countiesByID["US" + d.id] = newCounty;
      statesByName["Unassigned"].counties.push(newCounty);
      return "US" + d.id;
    })
    .attr("class", "county")
    .on("click", function(d) {
      var radios = document.getElementsByName("state");
      for (var i = 0; i < radios.length; i++) {
        var r = radios[i];
        if (r.checked) {
          assignCounty(countiesByID["US" + d.id], r.value);
          reload();
          break;
        }
      }
    })
    .on("mouseenter", function(d) {
      if (hoverMode) {
        var radios = document.getElementsByName("state");
        for (var i = 0; i < radios.length; i++) {
          var r = radios[i];
          if (r.checked) {
            assignCounty(countiesByID["US" + d.id], r.value);
            reload();
            break;
          }
        }
      } else {
        tooltip.transition().duration(100).style("opacity", .9);

        var countyData = countiesByID["US" + d.id];
        let state = countyData.getState();
        tooltip.append("span").append("b").append("u").append("center").html(countyData.name.split(", ")[0] + (state !== "Unassigned" ? ", " + state : ""));
        if (d3.select("#popToggle").node().checked) {
          tooltip.append("span").html("Population: ") // County Population
                 .append("b").html(countyData.getStatistic('age_and_sex', 'totalPopulation').toLocaleString()).append("br");
        }
        if (d3.select("#pviToggle").node().checked) {
          tooltip.append("span").html("PVI: ") // County PVI
                 .append("b").html(countyData.getStatistic('politics', 'pvi').toLocaleString()).append("br");
        }
        if (d3.select("#medIncomeToggle").node().checked) {
          tooltip.append("span").html("Median Household Income: ") // County Median Household Income
                 .append("b").html('$' + countyData.getStatistic('income', 'medianIncome').toLocaleString()).append("br");
        }
        if (d3.select("#educatedToggle").node().checked) {
          tooltip.append("span").html("College Educated: ")
                .append("b").html(countyData.getStatistic('education', 'percentBachelorsOrHigher').toLocaleString() + '%').append("br");
        }

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
  if (dataReady) {
    reload();
  }
});

for (var file in dataFiles) {
  craftXHR(file);
}

function assignExistingStates() {
  var modal = createModal().querySelector(".modalContent");

  var p = modal.appendChild(ned("p"));
  p.innerHTML = "Choose Starting Setup";

  var blankBtn = modal.appendChild(ned("button"));
  //blankBtn.attr("class", "button light");
  blankBtn.innerHTML = "Blank Map";
  blankBtn.onclick = function() {
    disposeModal(modal);
    reload();
  }

  var filledBtn = modal.appendChild(ned("button"));
  filledBtn.innerHTML = "US State Map";
  filledBtn.onclick = function() {
    let colors = {};
    colors["red"] = "#FFAFAF";
    colors["pink"] = "#FFAFFF";
    colors["yellow"] = "#FFFFAF";
    colors["green"] = "#AFFFAF";

    for (let stateName in existingStates) {
      statesByName[stateName] = new State(stateName, colors[existingStates[stateName].color]);
    }
    for (let countyID in countiesByID) {
      let stateName = countiesByID[countyID].name.split(", ")[1];
      console.log(stateName, statesByName[stateName]);
      assignCounty(countiesByID[countyID], stateName);
    }

    disposeModal(modal);
    reload();
  }

  showModal(modal);
}
