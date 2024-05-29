import { County } from "./county.js";
import { State } from "./state.js";
import dataFiles from "./data.json";

const PVI_SHIFT = -1.89

var unassigned = new State("Unassigned", "#D1DBDD");
var countiesByID = {};
var statesByName = {"Unassigned": unassigned};
var hoverMode = false; // select counties by hovering over them rather than clicking
var mapReady = false;
var dataReady = false;
var usMap;
var usMapN;

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
  var state = statesByName[stateName];
  statesByName[county.getState()].removeCounty(county);
  state.addCounty(county);
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
        tooltip.append("span").html(countyData.name).append("br").append("br");
        tooltip.append("span").append("b").html(countyData.getState()).append("br");
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

function aiGen(noStates = 50, derv = 0.50) {
  for (var id in usMap.features) {
    var mapCounty = usMap.features[id];
    if (countiesByID["US" + mapCounty.id] === undefined) {
      console.log(mapCounty.id);
    }
    countiesByID["US" + mapCounty.id].neighbors = [];
    for (var i in mapCounty.neighbors) {
      countiesByID["US" + mapCounty.id].neighbors.push("US" + mapCounty.neighbors[i].id);
    }
  }

  // link alaska to washington
  countiesByID['US53055'].neighbors.push('US02198');
  countiesByID['US02198'].neighbors.push('US53055');
  // link hawaii to california
  countiesByID['US06025'].neighbors.push('US15001');
  countiesByID['US15001'].neighbors.push('US06025');

  var os = {
    "State 1": {
      population: 0,
      counties: []
    },
  };
  var cs = "State 1";
  var csi = 1;

  console.log("Beginning alogrithmic state generation");
  var counties = statesByName["Unassigned"].counties;
  console.log((counties).length + " counties to assign into " + noStates + " states");
  console.log("permitted population dervication: " + (derv * 100) + "%");
  var pps = round(aggregateState(statesByName["Unassigned"]).getStatistic('age_and_sex', 'total population') / noStates, 0);
  var lpps = round(pps - pps * derv, 0);
  var upps = round(pps + pps * derv, 0);
  console.log("Population Per State: " + pps.toLocaleString());
  console.log("\tLowerbound: " + lpps.toLocaleString());
  console.log("\tUpperbound: " + upps.toLocaleString());

  var touched = [];
  var ntt = counties.length;
  while (touched.length !== ntt) {
    for (var countyNum in counties) {
      var county = countiesByID[counties[countyNum]];
      var id = "US" + county.id;
      if (touched.includes(id)) {
        continue;
      }
      touched.push(id);
      console.log("considering: " + county.name);
      if (os[cs].population + county.getStatistic('age_and_sex', 'total population') < upps) {
        touched.push("US" + county.id);
        os[cs].counties.push("US" + county.id);
        console.log("Added " + county.name + " to " + cs);
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

for (var file in dataFiles) {
  craftXHR(file);
}

reload();
