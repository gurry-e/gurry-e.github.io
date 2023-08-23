function createModal(close = false) {
    var modal = ned("div")
    modal.className = "modal"
    var modal_content = modal.appendChild(ned("div"))
    modal_content.className = "modal-content"

    if (close) {
        var btn = modal_content.appendChild(ned("span"))
        btn.className = "close"
        btn.innerHTML = "&times;"
        btn.onclick = function() {
            document.body.removeChild(modal)
            keyEngaged = false
        }
    }

    return modal
}

console.log("HEYYY")
var scl = true
var ssl = true
console.log(d3.select("#county-lines"))
d3.select("#county-lines").on("change",function(){
    console.log("show county lines?" + !scl)
    if (scl) {
        d3.selectAll("path.county-borders").each(function(d){
            var me = d3.select(this)
            me.classed("county-borders",false)
        })
    } else {
        
    }
})

function ned(type) {
    return document.createElement(type)
}

var mapReady = false
var dataReady = false

var onCreate = true;

var modal = createModal().querySelector(".modal-content");
modal.appendChild(ned("p")).innerHTML = "The map is loading (this can take a few minutes)"
document.body.appendChild(modal.parentElement)
modal.parentElement.style.display = 'block'

function appendLoadModal(txt) {
    modal.appendChild(ned("p")).innerHTML = txt
}

var metric = "race"

function closeLoadModal() {
    appendLoadModal("Done!")
    document.body.removeChild(modal.parentElement)
    d3.selectAll(".metric").each(function(d){
        var me = d3.select(this)
        me.on("click",function(){
            var heading = d3.select("#metric-heading").node()
            var table = d3.select("#metric-table").node()
            table.innerHTML = ''
            metric = me.attr("id")
            table.appendChild(ned("tbody"))
            var thead = table.appendChild(ned("thead"))
            switch (metric) {
                case "race":
                    heading.innerHTML = "Race Metrics"
                    var tr = thead.appendChild(ned("tr"))
                    tr.appendChild(ned("th")).innerHTML = "Race"
                    tr.appendChild(ned("th")).innerHTML = "Population"
                    break;
            }
        })
    })
}

function englishRace(race) {
    switch (race) {
    case "white": return "White"
    case "black": return "Black"
    case "asian": return "Asian"
    case "native": return "Native American"
    case "pacific": return "Pacific Islander"
    case "biracial": return "Biracial"
    case "other": return "Others"
    }
}

function allReady() {
    return mapReady && dataReady;
}

var width = 960,
    height = 600,
    active = d3.select(null);

var zoom = d3.zoom()
    .scaleExtent([1, 32])
    .on("zoom", zoomed);

var new_states = {
    "U.S. Unorganized": []
};

var new_states_color = {
    "U.S. Unorganized": "none"
}

var svg = d3.select("svg");
    svg.on("click", stopped, true);

var path = d3.geoPath()

var g = svg.append("g");

svg.call(zoom)

d3.json("us.json", function(error, us) {
    if (error) throw error;
    appendLoadModal("Map received, loading")

    g.attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("class", "county-path")
        .attr("d", path)
        .attr("id", function(d) {
            return "US" + d.id
        })
        .on("click", function(d) {
            var me = d3.select(this);
            console.log(d.id)
            me.classed("active", !me.classed("active"))
        })
        .on("mouseover", function(d){
            var me = d3.select(this)
            var table = d3.select("#metric-table").node().querySelector("tbody")
            table.innerHTML = ''
            var fcd = full_county_data["US"+d.id]
            d3.select("#metric-o-heading").node().innerHTML = fcd.meta.name
            for (var ns in new_states) {
                var state = new_states[ns]
                if (state.includes("US"+d.id)) {
                    d3.select("#real-state").node().innerHTML = ns
                }
            }
            for (var race in fcd.population.race) {
                var pop = Number(fcd.population.race[race])
                var pct = round(pop/fcd.population.total, 2) * 100
                var tbody = table.appendChild(ned("tr"))
                tbody.appendChild(ned("td")).innerHTML = englishRace(race)
                tbody.appendChild(ned("td")).innerHTML = pop.toLocaleString() +" ("+pct+"%)"
            }
        })


    g.append("path")
        .attr("class", "county-borders")
        .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })))
        .attr("did", "did".getdid)

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "state-borders")
        .attr("d", path)
        .attr("did", "did".getdid)

    console.log("counties: " + d3.selectAll("path.county-path")._groups[0].length)
    d3.selectAll("path.county-path").each(function(d) {
        new_states["U.S. Unorganized"].push("US" + d.id)
    })
    console.log("real counites: " + new_states["U.S. Unorganized"].length)
    appendLoadModal("Finished drawing map")
    mapReady = true;
    checkAndCloseLoad()
});

function refa(e, a) {
    var index = a.indexOf(e);
    a.splice(index, 1)
}

var keyEngaged = false;


d3.select("body").on("keypress", function(ev) {
    if (keyEngaged) {
        console.log("key already engaged");
        return;
    }

    if (!allReady()) {
        console.log("map/data not ready")
        return;
    }

    keyEngaged = true;
    if (d3.event.keyCode == 110) {
        // ok creating a state
        if (onCreate) {
            console.log("wow wow wubzy a new state!")
            var modal = createModal(true);
            var ctn = modal.querySelector(".modal-content")
            var name_paragraph = ctn.appendChild(ned("p"))
            name_paragraph.innerHTML = "State Name: ";
            var namei = name_paragraph.appendChild(ned("input"))
            var color_paragraph = ctn.appendChild(ned("p"));
            color_paragraph.innerHTML = "Color: "
            var input = color_paragraph.appendChild(ned("input"))
            input.className = "jscolor"
            input.value = "#ffcc00"
            var btn = ned("button");
            btn.innerHTML = "Create State";
            ctn.appendChild(btn)
            modal.style.display = "block"
            document.body.appendChild(modal)
            jscolor.installByClassName("jscolor");
            namei.focus()
            namei.value = ''
            btn.onclick = function() {
                var name = namei.value
                console.log("\tname: " + name);
                new_states[name] = []
                new_states_color[name] = input.value;
                d3.selectAll("path.active").each(function(d) {
                    var me = d3.select(this)
                    var fcd = full_county_data["US" + d.id];
                    console.log(fcd)
                    me.classed("active", false)
                    me.attr("fill", "#" + input.value)
                    console.log("\t" + me.attr("fill"))
                    for (var ns in new_states) {
                        var nsd = new_states[ns];
                        if (nsd.includes(fcd.meta.id)) {
                            var index = nsd.indexOf(fcd.meta.id)
                            nsd.splice(index, 1)
                            console.log("removed " + fcd.meta.name + " from " + ns)
                        }

                    }
                    console.log("adding " + fcd.meta.name + " (" + fcd.meta.id + ") to " + name)
                    new_states[name].push(fcd.meta.id)
                    reload()
                })

                keyEngaged = false;
                document.body.removeChild(modal);
                reload()
            }
        }
        else { //group mode
            var modal = createModal(true);
            var ctn = modal.querySelector(".modal-content")
            var select = ctn.appendChild(ned("select"));
            for (var ns in new_states) {
                var option = ned("option");
                option.value = ns;
                option.innerHTML = ns;
                select.appendChild(option);
            }
            var btn = ned("button");
            btn.innerHTML = "Move Counties"
            ctn.appendChild(btn)
            modal.style.display = 'block'
            document.body.appendChild(modal)
            btn.onclick = function() {
                d3.selectAll("path.active").each(function(d) {
                    var me = d3.select(this);
                    var fcd = full_county_data["US" + d.id];
                    for (var ns in new_states) {
                        var nsd = new_states[ns]
                        if (nsd.includes(fcd.meta.id)) {
                            refa(fcd.meta.id, nsd) //remove element from array
                            break;
                        }
                    }
                    me.classed("active", false)
                    console.log(select.value)
                    me.attr("fill", "#" + new_states_color[select.value])
                    new_states[select.value].push(fcd.meta.id)
                    reload()
                })
                keyEngaged = false;
                document.body.removeChild(modal)
            }
        }
    }

    else if (d3.event.keyCode == 99) {
        console.log("switching configuration")
        //ok reconfiguring how the counties are drawn
        onCreate = !onCreate
        var modep = document.getElementById("modep")
        if (onCreate) {
            modep.innerHTML = "You are on mode <b>create</b>. Select any number of counties and press \"N\" to group them into one state."
        }
        else {
            modep.innerHTML = "You are on mode <b>move</b>. Select any number of states and press \"N\" to move them into another state"
        }
        keyEngaged = false;
    }

    else if (d3.event.keyCode == 115) {
        var modal = createModal(true).querySelector(".modal-content")
        modal.appendChild(ned("p")).innerHTML = "It can take some time to generate the share values"
        modal.appendChild(ned("p")).innerHTML = "Copy down <b>BOTH</b> values. You can load them later by coming back and pressing \"L\""

        var div = modal.appendChild(ned("div"))
        var states = btoa(JSON.stringify(new_states))
        div.appendChild(ned("p")).innerHTML = "STATE VALUES:<br/>" + states;
        var colors = btoa(JSON.stringify(new_states_color))
        div.appendChild(ned("p")).innerHTML = "COLOR VALUES:<br/>" + colors

        document.body.appendChild(modal.parentElement)
        modal.parentElement.style.display = "block"

        keyEngaged = false;
    }

    else if (d3.event.keyCode == 108) {
        modal = createModal(true).querySelector(".modal-content")

        var state_values = modal.appendChild(ned("textarea"))
        state_values.style.width = "100%"
        state_values.placeholder = "State Values"
        var color_values = modal.appendChild(ned("textarea"))
        color_values.style.width = "100%"
        color_values.placeholder = "Color Values"

        var btn = modal.appendChild(ned("button"))
        btn.innerHTML = "Load Values"
        btn.onclick = function() {
            new_states = JSON.parse(atob(state_values.value))
            new_states_color = JSON.parse(atob(color_values.value))
            document.body.removeChild(modal.parentElement)
            reload()
        }

        document.body.appendChild(modal.parentElement)
        modal.parentElement.style.display = 'block'

        keyEngaged = false;
    }

    else {
        keyEngaged = false;
    }
    reload()
});

function reloadMap() {
    for (var n in new_states) {
        for (var sid in new_states[n]) {
            var state = new_states[n][sid]
            d3.select("path#" + state).attr("fill", "#" + new_states_color[n])
        }
    }
}

function getdid(d) {
    return d.id.toString()
}

function select(d) {
    console.log(d)
    var b = d3.select(this)
    if (b.classed("active")) {
        return deselect(b);
    }
    else {
        active = b.classed("active", true)
        console.log(active.classed("active"))
        selected_counties.push(active.id);
    }
}

function deselect(d) {
    console.log("deselect squad")
    active.classed("active", false)
    var i = selected_counties.indexOf(d.id)
    selected_counties.splice(i, 1)
}

function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(750)
        // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)); // updated for d3 v4
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
        .call(zoom.transform, d3.zoomIdentity); // updated for d3 v4
}

function zoomed() {
    // g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    g.attr("transform", d3.event.transform); // updated for d3 v4
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

var ecs = 435;
var ecs_left = ecs;
var appor = {};

function computeElectors(states_pop) {
    ecs_left = ecs
    appor = {}
    console.log(states_pop)
    while (ecs_left > 0) {
        var highhest = undefined;
        var highA = 0
        for (var key in states_pop) {
            if (appor[key] == undefined || appor[key]==0) {
                console.log(key+" has zero; must have 1")
                appor[key] = 1;
                ecs_left -= 1
            }
            if (ecs_left == 0) break;
            var pop = states_pop[key]

            var s = appor[key]
            var V = pop
            var b4sqrt = s * (s + 1)
            var d = Math.sqrt(b4sqrt)
            var A = V/d
            if (A>highA) {
                highhest = key
                highA = A
            }
        }
        appor[highhest]++;
        ecs_left--;
    }
    console.log(appor)
}

function reload() {
    reloadMap()
    var table = document.getElementById("nstates-table").querySelector("tbody");
    table.innerHTML = ''
    var states_pop = {}
    for (var key in new_states) {
        if (new_states[key].length == 0) {
            delete new_states[key]
        }
        else {
            var population = 0;
            var v_trump = 0;
            var v_clinton = 0;
            var votes16 = 0;
            var v_romney = 0;
            var v_obama = 0;
            var votes12 = 0;
            var whites = 0,
                blacks = 0,
                asians = 0,
                pacifics = 0,
                natives = 0,
                biracials = 0,
                others = 0

            //for (var key in new_states) {
            // console.log("RELOAD key: " + key)
            for (var id in new_states[key]) {
                var fips = new_states[key][id]
                var fcd = full_county_data[fips]
                if (fcd == undefined) {
                    // console.log("\tRELOAD: fcd undfeined " + fips)
                }
                if (fcd.population == undefined) {
                    // console.log("\tRELOAD: fcd.population undefied " + fips)
                }
                if (fcd.population.total == undefined) {
                    fcd.population.total = 0
                }
                population += parseInt(fcd.population.total)
                if (isNaN(population)) {
                    console.error("^^^^^^" + fcd.population.total)
                    return;
                }
                var r = fcd.population.race
                if (isNaN(r.white)) r.white = 0;
                if (isNaN(r.black)) r.black = 0;
                if (isNaN(r.asian)) r.asian = 0;
                if (isNaN(r.native)) r.native = 0;
                if (isNaN(r.pacific)) r.pacific = 0;
                if (isNaN(r.biracial)) r.biracial = 0;
                if (isNaN(r.other)) r.other = 0;
                whites += Number(r.white)
                blacks += Number(r.black)
                asians += Number(r.asian)
                pacifics += Number(r.pacific)
                natives += Number(r.native)
                biracials += Number(r.biracial)
                others += Number(r.biracial)

                if (fcd.meta.name.includes("Alaska")) continue;
                if (isNaN(fcd.meta.pres2016.dem)) {
                    fcd.meta.pres2016.dem = 0
                }
                if (isNaN(fcd.meta.pres2016.gop)) {
                    fcd.meta.pres2016.gop = 0
                }
                if (isNaN(fcd.meta.pres2016.votes)) {
                    fcd.meta.pres2016.votes = 0;
                }
                if (isNaN(fcd.meta.pres2012.dem)) {
                    fcd.meta.pres2012.dem = 0
                }
                if (isNaN(fcd.meta.pres2012.gop)) {
                    fcd.meta.pres2012.gop = 0
                }
                if (isNaN(fcd.meta.pres2012.votes)) {
                    fcd.meta.pres2012.votes = 0;
                }

                v_trump += Number(fcd.meta.pres2016.gop)
                v_clinton += Number(fcd.meta.pres2016.dem)
                votes16 += Number(fcd.meta.pres2016.votes)
                v_romney += Number(fcd.meta.pres2012.gop)
                v_obama += Number(fcd.meta.pres2012.dem)
                votes12 += Number(fcd.meta.pres2012.votes)
                //}
            }

            var tr = table.appendChild(ned("tr"))
            var statetd = tr.appendChild(ned("td"))
            statetd.innerHTML = key
            statetd.className = "fakeBtn"
            d3.select(statetd).on("click",function(){
                keyEngaged = true
                var me = d3.select(this)
                var modal = createModal(true).querySelector(".modal-content")
                var key = me.node().innerHTML
                
                var p1 = modal.appendChild(ned("p"))
                p1.innerHTML = "State Name: "
                var name = p1.appendChild(ned("input"))
                name.value = key
                
                var p2 = modal.appendChild(ned("p"))
                p2.innerHTML = "State Color: "
                var color = p2.appendChild(ned("input"))
                color.type = "jscolor"
                color.className = "jscolor"
                color.value = "#" + new_states_color[key]
                
                var btn = modal.appendChild(ned("button"))
                btn.innerHTML = "Update State"
                btn.onclick = function(){
                    var ns = name.value
                    var nc = color.value
                    var nca = new_states[key]
                    var ncca = new_states_color[key]
                    delete new_states[key]
                    delete new_states_color[key]
                    new_states[ns] = nca
                    new_states_color[ns] = nc
                    reload()
                    document.body.removeChild(modal.parentElement)
                    keyEngaged = false
                }
                
                document.body.appendChild(modal.parentElement)
                modal.parentElement.style.display = 'block'
                
                jscolor.installByClassName("jscolor");
                d3.select(null)
            })
            var popp = tr.appendChild(ned("td"))
            popp.innerHTML = parseInt(population).toLocaleString()
            popp.className = "population"
            //console.log("v_trump " + v_trump)
            //console.log("v_clinton" + v_clinton)
            var td = tr.appendChild(ned("td"))
            var p1 = td.appendChild(ned("p"))

            var clinton = round((v_clinton - v_trump) / votes16, 2) * 100;
            var obama = round((v_obama - v_romney) / votes12, 2) * 100;

            if (v_trump > v_clinton) {
                p1.innerHTML = "Trump 2016 +" + round(((v_trump - v_clinton) / votes16) * 100, 2)
                p1.style.color = "darkred"
            }
            else if (v_clinton == v_trump) {
                p1.innerHTML = "EVEN 2016"
            }
            else {
                p1.innerHTML = "Clinton 2016 +" + (round(((v_clinton - v_trump) / votes16) * 100, 2))
                p1.style.color = "darkblue"
            }

            var p2 = td.appendChild(ned("p"))
            if (v_romney > v_obama) {
                p2.innerHTML = "Romney 2012 +" + round(((v_romney - v_obama) / votes12) * 100, 2)
                p2.style.color = "darkred"
            }
            else if (v_obama == v_romney) {
                p2.innerHTML = "EVEN 2012"
            }
            else {
                p2.innerHTML = "Obama 2012 +" + (round(((v_obama - v_romney) / votes12) * 100, 2))
                p2.style.color = "darkblue"
            }

            var p3 = td.appendChild(ned("p"))
            if (clinton > obama) {
                p3.innerHTML = "+" + (clinton - obama)
                p3.style.color = "darkblue"
            }
            else {
                p3.innerHTML = "+" + (obama - clinton)
                p3.style.color = "darkred"
            }

            td = tr.appendChild(ned("td"))
            var white = td.appendChild(ned("p")).innerHTML = round(whites / population, 2) * 100 + "% White";
            var black = td.appendChild(ned("p")).innerHTML = round(blacks / population, 2) * 100 + "% Black";
            var asian = td.appendChild(ned("p")).innerHTML = round(asians / population, 2) * 100 + "% Asian";
            var native = td.appendChild(ned("p")).innerHTML = round(natives / population, 2) * 100 + "% Native American";
            var pacific = td.appendChild(ned("p")).innerHTML = round(pacifics / population, 2) * 100 + "% Pacific Islander";
            var biracial = td.appendChild(ned("p")).innerHTML = round(biracials / population, 2) * 100 + "% Biracial";
            var other = td.appendChild(ned("p")).innerHTML = round(others / population, 2) * 100 + "% Other";

            states_pop[key] = population;
        }
    }
    computeElectors(states_pop)
    appor.key = function(n) {
        return this[Object.keys(this)[n]];
    }
    var popps = document.getElementsByClassName("population")
    for (var ps in popps) {
        var p = popps[ps]
        p.innerHTML = p.innerHTML + "<br/>Electoral Votes: " + appor.key(ps)
    }
}

function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}


var full_county_data = {}

function setupcounty(county) {
    var id = county.id
    var name = county.name
    full_county_data[id] = {
        meta: {
            name: name,
            id: id,
            pres2016: {},
            pres2012: {}
        },
        population: {
            age: {},
            sex: {},
            race: {}
        },
        households: {
            status: {
                types: {
                    martial: {},
                    families: {}
                },
                poverty: {
                    food_stamps: {}
                },
                language: {
                    mono_english_speakers: {},
                    mono_spanish_speakers: {},
                    mono_european_speakers: {},
                    mono_other_speakers: {}
                }
            },
            income: {},
            employment: {}
        },
        education: {
            enrollment: {},
            attainment: {}
        }
    };
}

var datum = [
    "ageandsexdata.csv",
    "educationalattainmentdata.csv",
    "employmentstatusdata.csv",
    "foodstampsdata.csv",
    "householdsdata.csv",
    "incomedata.csv",
    "languagedata.csv",
    "martialstatus.csv",
    "racedata.csv",
    "schoolenrollmentdata.csv",
]

var resps = {}
var datas = {}
var counties = {
    "US46102": "Ogala Lakota County, South Dakota",
    "US02158": "Kusilvak Census Area, Alaska",
    // "US05089": "Marion County, Arksansas"
}

for (var ds in datum) {
    var d = datum[ds]
    resps[d] = false;
    craftXHR(d)
}

function craftXHR(d) {
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'census_data/' + d, true)
    appendLoadModal("Requesting data: " + d)
    xhr.send();

    xhr.onload = function(e) {
        if (!this.status == 200) {
            console.error("an error occured loading " + d);
            console.error("status code: " + this.status)
            return;
        }
        var data = d3.csvParse(this.response)
        appendLoadModal("Received data: " + d)
        datas[d] = data
        resps[d] = true;
        if (d == "us16.12.csv") {
            processCensusData()
            return;
        }
        for (var vd in resps) {
            if (resps[vd] == false) {
                return;
            }
        }
        for (var i = 1; i < data.length; i++) {
            var id = data[i]["GEO.id2"];
            var name = data[i]["GEO.display-label"]
            counties["US" + id] = name
        }
        craftXHR("us16.12.csv")
    }
}

function processCensusData() {
    console.log("processing census data...")
    for (var id in counties) {
        setupcounty({
            id: id,
            name: counties[id]
        })
    }
    console.log("county data structure initialized")
    for (var id in datum) {
        var dname = datum[id]
        console.log("processing: " + dname)
        var data = datas[dname];
        switch (dname) {
            case "ageandsexdata.csv":
                handleAgeAndSex(data);
                break;
            case "educationalattainmentdata.csv":
                handleEdducationalAttainment(data);
                break;
            case "employmentstatusdata.csv":
                handleEmploymentStatus(data);
                break;
            case "foodstampsdata.csv":
                handleFoodStamps(data);
                break;
            case "householdsdata.csv":
                handleHouseholds(data);
                break;
            case "incomedata.csv":
                handleIncome(data);
                break;
            case "languagedata.csv":
                handleLanguage(data);
                break;
            case "martialstatus.csv":
                handleMartialStatus(data);
                break;
            case "racedata.csv":
                handleRace(data);
                break;
            case "schoolenrollmentdata.csv":
                handleSchoolEnrollment(data);
                break;
            case "us16.12.csv":
                handleElection(data);
                break;
        }
    }
    handleElection(datas["us16.12.csv"])
    console.log("completed")
    dataReady = true;
    checkAndCloseLoad()
    reload()
}

function checkAndCloseLoad() {
    if (allReady()) {
        closeLoadModal()
    }
}


function handleAgeAndSex(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]

        //console.log(county)
        if (fcd == undefined) {
            console.log(fcd)
        }

        fcd.population.total = county["HC01_EST_VC01"];

        fcd.population.sex.female = county["HC03_EST_VC01"];
        fcd.population.sex.male = county["HC02_EST_VC01"];

        fcd.population.age.under_5 = county["HC01_EST_VC03"];
        fcd.population.age.between_5_9 = county["HC01_EST_VC04"]
        fcd.population.age.between_10_14 = county["HC01_EST_VC05"]
        fcd.population.age.between_15_19 = county["HC01_EST_VC06"]
        fcd.population.age.between_20_24 = county["HC01_EST_VC07"]
        fcd.population.age.between_25_29 = county["HC01_EST_VC08"]
        fcd.population.age.between_30_34 = county["HC01_EST_VC09"]
        fcd.population.age.between_35_39 = county["HC01_EST_VC10"]
        fcd.population.age.between_40_44 = county["HC01_EST_VC11"]
        fcd.population.age.between_49_49 = county["HC01_EST_VC12"]
        fcd.population.age.between_50_54 = county["HC01_EST_VC13"]
        fcd.population.age.between_55_59 = county["HC01_EST_VC14"]
        fcd.population.age.between_60_64 = county["HC01_EST_VC15"]
        fcd.population.age.between_65_69 = county["HC01_EST_VC16"]
        fcd.population.age.between_70_74 = county["HC01_EST_VC17"]
        fcd.population.age.between_75_79 = county["HC01_EST_VC18"]
        fcd.population.age.between_80_84 = county["HC01_EST_VC19"]
        fcd.population.age.above_85 = county["HC01_EST_VC20"]
    }
}

function handleEdducationalAttainment(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.education.attainment.no_hs_diploma = county["HC01_EST_VC02"]
        fcd.education.attainment.hs_graduate = county["HC01_EST_VC03"]
        fcd.education.attainment.some_college = county["HC01_EST_VC04"]
        fcd.education.attainment.college_graduate = county["HC01_EST_VC05"]
    }
}

function handleEmploymentStatus(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.households.employment.working_age_population = county["HC01_EST_VC01"]
        fcd.households.employment.in_labor_force = county["HC02_EST_VC01"]
        fcd.households.employment.employed = county["HC03_EST_VC01"]
        fcd.households.employment.unemployed = county["HC04_EST_VC01"]
    }
}

function handleFoodStamps(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.households.total = county["HC01_EST_VC01"]
        fcd.households.status.poverty.food_stamps.receiving = county["HC02_EST_VC01"]
        fcd.households.status.poverty.food_stamps.not_receiving = county["HC03_EST_VC01"]
    }
}

function handleHouseholds(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.households.status.types.families.married_households = county["HC02_EST_VC02"]
        fcd.households.status.types.families.male_households = county["HC03_EST_VC02"]
        fcd.households.status.types.families.female_households = county["HC04_EST_VC02"]
        fcd.households.status.types.families.nonfamily_households = county["HC05_EST_VC02"]
    }
}

function handleIncome(data) {
    console.error("income needs a better data input")
}

function handleLanguage(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.households.status.language.mono_english_speakers.very_well = county["HC02_EST_VC02"]
        fcd.households.status.language.mono_english_speakers.less_than = county["HC03_EST_VC02"]

        fcd.households.status.language.mono_spanish_speakers.very_well = county["HC02_EST_VC04"]
        fcd.households.status.language.mono_spanish_speakers.less_than = county["HC03_EST_VC04"]

        fcd.households.status.language.mono_european_speakers.very_well = county["HC02_EST_VC05"]
        fcd.households.status.language.mono_european_speakers.less_than - county["HC03_EST_VC05"]

        fcd.households.status.language.mono_other_speakers.very_well = county["HC02_EST_VC07"]
        fcd.households.status.language.mono_other_speakers.less_than = county["HC03_EST_VC07"]
    }
}

function handleMartialStatus(data) {
    console.error("martial status NYI")
}

function handleRace(data) {
    for (var i = 1; i < data.length; i++) {
        var county = data[i];
        var fcd = full_county_data["US" + county["GEO.id2"]]
        fcd.population.race.white = county["HD01_VD02"]
        fcd.population.race.black = county["HD01_VD03"]
        fcd.population.race.native = county["HD01_VD04"]
        fcd.population.race.asian = county["HD01_VD05"]
        fcd.population.race.pacific = county["HD01_VD06"]
        fcd.population.race.other = county["HD01_VD07"]
        fcd.population.race.biracial = county["HD01_VD10"]
    }
}

function handleSchoolEnrollment(data) {
    console.error("school enrollment NYI")
}

function handleElection(data) {
    for (var i = 0; i < data.length; i++) {
        var county = data[i];
        var id = county["GEO.id2"];
        if (id.length == 4) id = "0" + id;
        var fcd = full_county_data["US" + id]
        fcd.meta.pres2012.dem = parseInt(county["votes_dem_2012"])
        fcd.meta.pres2012.gop = county["votes_gop_2012"]
        fcd.meta.pres2012.votes = county["total_votes_2012"]

        fcd.meta.pres2016.dem = county["votes_dem_2016"]
        fcd.meta.pres2016.gop = county["votes_gop_2016"]
        fcd.meta.pres2016.votes = county["total_votes_2016"]
    }
}

function aggregate(arr) {
    res = {
        meta: {
            name: [],
            id: [],
            pres2016: {},
            pres2012: {}
        },
        population: {
            age: {},
            sex: {},
            race: {}
        },
        households: {
            status: {
                types: {
                    martial: {},
                    families: {}
                },
                poverty: {
                    food_stamps: {}
                },
                language: {
                    mono_english_speakers: {},
                    mono_spanish_speakers: {},
                    mono_european_speakers: {},
                    mono_other_speakers: {}
                }
            },
            income: {},
            employment: {}
        },
        education: {
            enrollment: {},
            attainment: {}
        }
    }
    for (var i = 0; i < arr.length; i++) {
        var fcd = full_county_data[arr[i]];
        res.meta.name.push(fcd.meta.name)
        res.meta.id.push(fcd.meta.id)
        aggregatize(res, fcd, "education.attainment")
        aggregatize(res, fcd, "education.enrollment")
    }
    return res;
}

function aggregatize(res, fcd, table) {
    var a = table.split(".")
    var tfcd = fcd[a[0]]
    var tres = fcd[a[0]]
    for (var i = 1; i < a.length; i++) {
        //console.log("a["+i+"]: " + a[i])
        tfcd = tfcd[a[i]]
        tres = tres[a[i]]
        //console.log("tfcd: " + tfcd)
    }
    for (var key in tfcd) {
        tres[key] = Number(tres[key]) + Number(tfcd[key])
    }
    res.meta.aggregatized = true;
}

