const LMSG_ON = false // display loading messages when loading page

var full_county_data = {}
var new_states = {}
var keyEngaged = false // key commands can be used when false

newState("Unassigned", "000000", [])

var datas = {
    "ageandsexdata.csv": undefined,
    "educationalattainmentdata.csv": undefined,
    "employmentstatusdata.csv": undefined,
    "foodstampsdata.csv": undefined,
    "householdsdata.csv": undefined,
    "incomedata.csv": undefined,
    "languagedata.csv": undefined,
    "martialstatus.csv": undefined,
    "racedata.csv": undefined,
    "schoolenrollmentdata.csv": undefined,
    "us16.12.csv": undefined
}

var loadModal
if (LMSG_ON) {
    loadModal = createModal().querySelector(".modalContent")
    loadModal.parentElement.style.display = 'block'
    document.body.appendChild(loadModal.parentElement)
    console.log(loadModal.querySelector("span.fakeBtn"))
    loadModal.removeChild(loadModal.querySelector("span.fakeBtn"))
}

var mapReady = false, dataReady = false

/* Fetch census/political data */
lmsg("Downloading data")
for (var i in datas) {
    craftXHR(i)
}

/* Draw map */

var svg = d3.select("svg");
svg.on("click", function() { if (d3.event.defaultPrevented) d3.event.stopPropagation(); }, true);
var g = svg.append("g")

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var zoom = d3.zoom()
    .scaleExtent([1, 32])
    .on("zoom", function() {
        g.attr("transform", d3.event.transform);
    });

var path = d3.geoPath();
svg.call(zoom)

var usMap, usMapN

/*** Handle Events ***/

/* New State */
d3.select("button#newState").on("click", function() {
    var me = d3.select(this)
    var modal = createModal().querySelector(".modalContent")

    var p1 = modal.appendChild(ned("p"))
    p1.innerHTML = "State Name: "
    var name = p1.appendChild(ned("input"))

    var p2 = modal.appendChild(ned("p"))
    p2.innerHTML = "Color: "
    var color = p2.appendChild(ned("input"))
    color.className = "jscolor"
    color.type = "jscolor"

    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Create State"
    btn.onclick = function() {
        newState(name.value, "#" + color.value, [])
        disposeModal(modal)
    }

    showModal(modal)
    name.focus()

    reloadJscolor()
})

/* Save Map */
d3.select("#compressor").on("click", function() {
    var modal = createModal().querySelector(".modalContent")
    modal.appendChild(ned("p")).innerHTML = ("Please save the following string:")
    modal.appendChild(ned("p")).innerHTML = btoa(JSON.stringify(new_states))
    document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block'
})

/* Load Map */
d3.select("#decompressor").on("click", function() {
    var modal = createModal().querySelector(".modalContent")
    modal.appendChild(ned("p")).innerHTML = ("Enter your saved data: ")
    var tx = modal.appendChild(ned("textarea"))
    tx.style.width = "100%"
    tx.style.height = "100%"
    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Load Map"
    document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block'
    btn.onclick = function() {
        disposeModal(modal)
        new_states = JSON.parse(atob(tx.value))
        reload()
    }
})

/* Assign State */
d3.select("#assignState").on("click", function() {
    console.log("...")
    var modal = createModal().querySelector(".modalContent")
    modal.appendChild(ned("p")).innerHTML = ("Old State: ")
    var input = modal.appendChild(ned("input"))
    modal.appendChild(ned("p")).innerHTML = "New State: "
    var input2 = modal.appendChild(ned("input"))

    input.style.width = "100%"
    input2.style.width = "100%"

    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Assign"

    document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block'
    btn.onclick = function() {
        disposeModal(modal)
        for (var id in full_county_data) {
            var fcd = full_county_data[id]
            if (fcd.meta.name.endsWith(input.value)) {
                assignCounty(id, input2.value)
            }
        }
        reload()
    }
})

/* Show County Borders */
d3.select("#showCounties").on("change", function() {
    var me = d3.select(this).node()
    var paths = document.getElementsByClassName("countyBorders");
    if (me.checked) {
        for (var p in paths) {
            var path = paths[p];
            if (typeof(path) != "object") {
                continue
            }
            path.style.stroke = "#BBBBBB"
            path.style.strokeWidth = "0.2px"
        }
        d3.selectAll("path.county").each(function(d) {
            var me2 = d3.select(this)

            me2.node().style = ''
        })
    }
    else {
        for (var p in paths) {
            var path = paths[p];
            if (typeof(path) != "object") {
                continue
            }
            path.style.stroke = "#000000"
            path.style.strokeWidth = "0px"
        }
        d3.selectAll("path.county").each(function(d) {
            var me2 = d3.select(this)
            //var state = new_states[gsci("US" + d.id)]

            me2.style("strokeWidth", "1px")
            me2.style("stroke", "#" + new_states[gsci("US" + d.id)].color)
        })
    }
})

/* Show State Borders */
d3.select("#showStates").on("change", function() {
    var me = d3.select(this).node()
    var paths = document.getElementsByClassName("stateBorders");
    if (me.checked) {
        for (var p in paths) {
            var path = paths[p];
            /*if (typeof(path) != "object") {
                continue
            }*/
            path.style.stroke = "#CCCCCC"
            path.style.strokeWidth = "0.6px"
        }
        d3.selectAll("path.state").each(function(d) {
            d3.select(this).node().style = ''
        })
    } else {
        for (var p in paths) {
            var path = paths[p];
            /*if (typeof(path) != "object") {
                continue
            }*/
            path.style.stroke = "#000000"
            path.style.strokeWidth = "0px"
        }
    }
})

d3.select("#countyColor").on("change", function() {
    var value = fvor("cc")
    var key = d3.select("#mapKey")
    var table = key.select("table")
    var thead = table.select("thead").node()
    thead.innerHTML = ''
    var tbody = table.select("tbody").node()
    tbody.innerHTML = ''
    if (value == "nc") {
        key.style("display", "none")
    }
    else if (value == "race") {
        key.style("display", "block")
        var trh = thead.appendChild(ned("tr"))
        trh.appendChild(ned("th")).innerHTML = "Race"
        trh.appendChild(ned("th")).innerHTML = "Color"


    }
})

d3.select("body").on("keypress", function(ev) {
    console.log("!")
    if (d3.event.keyCode == 108) {
        var modal = createModal().querySelector(".modalContent")

        var state_values = modal.appendChild(ned("textarea"))
        state_values.style.width = "100%"
        state_values.placeholder = "State Values"
        var color_values = modal.appendChild(ned("textarea"))
        color_values.style.width = "100%"
        color_values.placeholder = "Color Values"

        var btn = modal.appendChild(ned("button"))
        btn.innerHTML = "Load Values"
        btn.onclick = function() {
            var smol = JSON.parse(atob(state_values.value))
            var smol_color = JSON.parse(atob(color_values.value))
            new_states = {}
            for (var s in smol) {
                new_states[s] = {}
                new_states[s].color = "#" + smol_color[s]
                new_states[s].counties = []
                for (var i = 0; i < smol[s].length; i++) {
                    new_states[s].counties.push(smol[s][i])
                }
            }
            document.body.removeChild(modal.parentElement)
            reload()
        }

        // document.body.appendChild(modal.parentElement)
        modal.parentElement.style.display = 'block'

        keyEngaged = false;
    }
})

/*** DATA FUNCTIONS ***/

function craftXHR(d) {
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'census_data/' + d, true)
    lmsg("Loading data: " + d)
    xhr.send();

    xhr.onload = function(e) {
        if (!this.status == 200) {
            lmsg("an error occured loading " + d);
            lmsg("status code: " + this.status)
            return;
        }

        var data = d3.csvParse(this.response)
        lmsg("Done: data loaded: " + d)
        datas[d] = data
        for (var i in datas) {
            if (datas[i] == undefined) return;
        }

        processCensusData()
    }
}

function processCensusData() {
    lmsg("Processing: census data")

    processAgeSex(datas["ageandsexdata.csv"])
    processEducationalAttainment(datas["educationalattainmentdata.csv"])
    processEmploymentStatus(datas["employmentstatusdata.csv"])
    processPoverty(datas["foodstampsdata.csv"])
    processHouseholds(datas["householdsdata.csv"])
    processIncome(datas["incomedata.csv"])
    processLanguage(datas["languagedata.csv"])
    // processMartialStatus(datas["martialstatus.csv"])
    processPolitics(datas["us16.12.csv"])
    processRace(datas["racedata.csv"])
    // processSchoolEnrollment(datas["schoolenrollmentdata.csv"])

    lmsg("Done: processing census data")
    // some counties have been renamed, this keeps them consistent
    // shannon county, south dakota was renamed ogala lakota county and assigned new code
    full_county_data.US46102 = full_county_data.US46113
    full_county_data.US46102.meta.name = "Ogala Lakota County, South Dakota"

    // wade hampton census area, alaska is now kuslivak census area, alaska
    full_county_data.US02158 = full_county_data.US02270
    full_county_data.US02158.meta.name = "Kusilvak Census Area, Alaska"
    dataReady = true
    checkAndCloseLoad()
}

function setupCounty(id, name) {
    if (id.length == 4) id = "0" + id
    initCounty(id)
    full_county_data["US" + id].meta.name = name
}

function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function roundPct(num, places) {
    return round(num * 100, places)
}

function aggregate(arr, pct = false, population = 0, places = 0) {
    var res = 0;
    if (pct) {
        for (var i in arr) {
            res += Number(arr[i])
        }
        return round(res / 100 * population, places)
    }
    else {
        for (var i in arr) {
            res += Number(arr[i])
        }
        return round(res, places)
    }
}

function avg(arr) {
    var t = 0
    for (var i = 0; i < arr.length; i++) { t += arr[i] }
    return t / arr.length
}

function processRace(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.general.race.white = NaN
    }
}

function processPolitics(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.politics.presidential2016.total = Number(county["total_votes_2016"])
        fcd.politics.presidential2016.dem = Number(county["votes_dem_2016"])
        fcd.politics.presidential2016.gop = Number(county["votes_gop_2016"])
        fcd.politics.presidential2016.demPct = roundPct(fcd.politics.presidential2016.dem / fcd.politics.presidential2016.total, 2)
        fcd.politics.presidential2016.gopPct = roundPct(fcd.politics.presidential2016.gop / fcd.politics.presidential2016.total, 2)
        fcd.politics.presidential2016.margin = round(fcd.politics.presidential2016.gopPct - fcd.politics.presidential2016.demPct, 2)

        fcd.politics.presidential2012.total = Number(county["total_votes_2012"])
        fcd.politics.presidential2012.dem = Number(county["votes_dem_2012"])
        fcd.politics.presidential2012.gop = Number(county["votes_gop_2012"])
        fcd.politics.presidential2012.demPct = roundPct(fcd.politics.presidential2012.dem / fcd.politics.presidential2012.total, 2)
        fcd.politics.presidential2012.gopPct = roundPct(fcd.politics.presidential2012.gop / fcd.politics.presidential2012.total, 2)
        fcd.politics.presidential2012.margin = round(fcd.politics.presidential2012.gopPct - fcd.politics.presidential2012.demPct, 2)

        fcd.politics.swing = fcd.politics.presidential2016.margin - fcd.politics.presidential2012.margin
        fcd.politics.pvi = fcd.politics.presidential2012.margin + fcd.politics.presidential2016.margin
        fcd.politics.pvi = round(fcd.politics.pvi / 2, 2)

        if (isNaN(fcd.politics.swing)) fcd.politics.swing = 0
        if (isNaN(fcd.politics.pvi)) fcd.politics.pvi = fcd.politics.presidential2016.margin
    }
}

function processLanguage(dataset) {
    console.error("language data lacking")
    lmsg("warn: language data lacking")
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
    }
}

function processIncome(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.households.income.low = aggregate([
            county["HC01_EST_VC02"], county["HC01_EST_VC03"], county["HC01_EST_VC04"]
        ], true, fcd.population.households.total)
        fcd.population.households.income.lomid = aggregate([
            county["HC01_EST_VC02"], county["HC01_EST_VC05"], county["HC01_EST_VC06"], county["HC01_EST_VC07"]
        ], true, fcd.population.households.total)
        fcd.population.households.income.himid = aggregate([
            county["HC01_EST_VC02"], county["HC01_EST_VC08"], county["HC01_EST_VC09"]
        ], true, fcd.population.households.total)
        fcd.population.households.income.high = aggregate([
            county["HC01_EST_VC02"], county["HC01_EST_VC10"], county["HC01_EST_VC11"]
        ], true, fcd.population.households.total)
    }
}

function processHouseholds(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.households.status.types.married = Number(county["HC02_EST_VC02"])
        fcd.population.households.status.types.singleParent = aggregate([
            county["HC03_EST_VC02"], county["HC04_EST_VC02"]
        ], false)
        fcd.population.households.status.types.nonfamily = Number(county["HC05_EST_VC02"])
    }
}

function processPoverty(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.households.total = Number(county["HC01_EST_VC01"])
        fcd.population.households.status.poverty.foodStamps.receiving = Number(county["HC02_EST_VC01"])
        fcd.population.households.status.poverty.foodStamps.notReceiving = Number(county["HC03_EST_VC01"])
        fcd.population.households.status.poverty.foodStamps.receivingWithDependents = aggregate([
            county["HC02_EST_VC02"], county["HC02_EST_VC03"]
        ], false, fcd.population.households.total)
    }
}

function processEmploymentStatus(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.general.employment.workingAge = Number(county["HC01_EST_VC01"])
        fcd.population.general.employment.laborForce = aggregate([
            county["HC02_EST_VC01"]
        ], true, fcd.population.general.employment.workingAge)
        fcd.population.general.employment.employed = aggregate([
            county["HC03_EST_VC01"]
        ], true, fcd.population.general.employment.workingAge)
        fcd.population.general.employment.unemployed = aggregate([
            county["HC04_EST_VC01"]
        ], true, fcd.population.general.employment.workingAge)
        fcd.population.general.employment.notInLaborForce = fcd.population.general.employment.workingAge - fcd.population.general.employment.laborForce
    }
}

function processEducationalAttainment(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.education.attainment.lessHighschool = Number(county["HC01_EST_VC02"]) / 100 * fcd.population.total
        fcd.population.education.attainment.highschool = Number(county["HC01_EST_VC03"]) / 100 * fcd.population.total
        fcd.population.education.attainment.someCollege = aggregate([
            county["HC01_EST_VC04"]
        ], true, fcd.population.total)
        fcd.population.education.attainment.collegeDegree = aggregate([county["HC01_EST_VC05"]], true, fcd.population.total)
    }
}

function processAgeSex(dataset) {
    for (var i = 1; i < dataset.length; i++) {
        var county = dataset[i]
        var fcd = full_county_data["US" + county["GEO.id2"]]
        if (fcd == undefined) {
            setupCounty(county["GEO.id2"], county["GEO.display-label"])
            fcd = full_county_data["US" + county["GEO.id2"]]
        }
        fcd.population.total = Number(county["HC01_EST_VC01"])
        fcd.population.general.sex.male = Number(county["HC02_EST_VC01"])
        fcd.population.general.sex.female = Number(county["HC03_EST_VC01"])
        fcd.population.general.age.children = aggregate([
            county["HC01_EST_VC03"], county["HC01_EST_VC04"],
        ], true, fcd.population.total)
        fcd.population.general.age.teenagers = aggregate([
            county["HC01_EST_VC05"], county["HC01_EST_VC06"]
        ], true, fcd.population.total)
        fcd.population.general.age.youngAdults = aggregate([
            county["HC01_EST_VC07"], county["HC01_EST_VC08"], county["HC01_EST_VC09"], county["HC01_EST_VC10"]
        ], true, fcd.population.total)
        fcd.population.general.age.adults = aggregate([
            county["HC01_EST_VC11"], county["HC01_EST_VC12"], county["HC01_EST_VC13"], county["HC01_EST_VC14"]
        ], true, fcd.population.total)
        fcd.population.general.age.oldAdults = aggregate([
            county["HC01_EST_VC15"], county["HC01_EST_VC16"], county["HC01_EST_VC17"], county["HC01_EST_VC18"]
        ], true, fcd.population.total)
        fcd.population.general.age.seniors = aggregate([
            county["HC01_EST_VC19"], county["HC01_EST_VC20"]
        ], true, fcd.population.total)
    }
}

/*** GET DATA ***/

function lmsg(txt) {
    if (LMSG_ON) {
        loadModal.appendChild(ned("p")).innerHTML = txt
    }
}

function checkAndCloseLoad() {
    if (mapReady && dataReady && LMSG_ON) {
        disposeModal(loadModal)
    }
}

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    usMap = topojson.feature(us, us.objects.counties),
        usMapN = topojson.neighbors(us.objects.counties.geometries)

    usMap.features.forEach(function(county, i) {

        county.distance = Infinity;
        county.neighbors = usMapN[i].map(function(j) { return usMap.features[j]; });

    });

    lmsg("Drawing map")

    g.attr("class", "counties")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.counties).features)
     .enter().append("path")
     .attr("d", path)
     .attr("id", function(d) {
        new_states["Unassigned"].counties.push("US" + d.id)
        return "US" + d.id
     })
     .attr("class", "county")
     .on("click", function(d) {
        console.log(d.id)
        var me = d3.select(this);
        var radios = document.getElementsByName("state")
        for (var i = 0; i < radios.length; i++) {
            var r = radios[i]
            if (r.checked) {
                assignCounty("US" + d.id, r.value)
                reload()
                break;
            }
        }
     })
     .on("mouseenter", function(d) {
        tooltip.transition()
            .duration(100)
            .style("opacity", .9);

        var fcd = full_county_data["US" + d.id]
        tooltip.append("span")
               .html(fcd.meta.name).style("text-align", "center").append("br").append("br")
        tooltip.append("span")
               .style("text-align", "center").append("b").html(gsci("US" + fcd.meta.id)).append("br")
        tooltip.append("span")
               .html("Population: ").append("b").html(fcd.population.total.toLocaleString()).append("br")
        tooltip.append("span")
               .html("% White: ").append("b").html(fcd.population.general.race.white.toLocaleString()).append("br")
        tooltip.append("span")
               .html("PVI: ").append("b").html(fcd.politics.pvi.toLocaleString()).append("br")
        tooltip
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 48) + "px");
     })
     .on("mouseout", function(d) {
        tooltip.transition().duration(500).style("opacity", 0)
        tooltip.html('')
     })

    g.append("path")
        .attr("class", "countyBorders")
        .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })))

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "stateBorders")
        .attr("d", path)

    mapReady = true
    checkAndCloseLoad()
    lmsg("Done: drawing map")
});

/* ABSOLUTE LAST */
reload()
