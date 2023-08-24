function refa(a, e) {
    a.splice(a.indexOf(e), 1)
}

function ned(type) {
    return document.createElement(type)
}

function dned(type) {
    return d3.select(ned(type))
}

function createModal() {
    var modal = ned("div")
    modal.className = "modal"
    var content = modal.appendChild(ned("div"))
    content.className = "modalContent"

    var btn = content.appendChild(ned("span"))
    btn.className = "fakeBtn close"
    btn.innerHTML = "&times;"
    btn.onclick = function() {
        disposeModal(content)
    }

    return modal
}

function showModal(modalContent) {
    document.body.appendChild(modalContent.parentElement)
    modalContent.parentElement.style.display = 'block'
}

function disposeModal(modalContent) {
    document.body.removeChild(modalContent.parentElement)
    reload()
}

function assignCounty(id, state) {
    state = new_states[state]
    for (var n in new_states) {
        var staten = new_states[n]
        if (staten.counties.includes(id)) {
            refa(new_states[n].counties, id)
        }
    }
    state.counties.push(id)
    reload()
}

function gsci(county) {
    for (var sid in new_states) {
        var state = new_states[sid]
        if (state.counties.includes(county)) {
            return sid
        }
    }
    console.error("gsci: no state found for " + county)
}

/**
 * Create a new state with the given name, color, and counties
 * @param {*} name Unique state name
 * @param {*} color Color to assign to counties within this state
 * @param {*} counties List of counties within this state
 */
function newState(name, color, counties) {
    new_states[name] = {}
    new_states[name].color = color
    new_states[name].counties = counties
    reload()
}

function configState(state, nname, ncolor) {
    var old = new_states[state]
    delete new_states[state]
    new_states[nname] = old
    new_states[nname].color = ncolor
    reload()
}

function initCounty(id) {
    if (id.length == 4) id = + "0" + id
    var fcd = {
        meta: {
            id: id
        },
        politics: {
            presidential2016: {},
            presidential2012: {}
        },
        population: {
            general: {
                age: {},
                sex: {},
                race: {},
                employment: {}
            },
            households: {
                status: {
                    matrial: {},
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
        }
    }
    full_county_data["US" + id] = fcd
}

function fvor(name) {
    var radios = document.getElementsByName(name)
    for (var r in radios) {
        var radio = radios[r]
        if (radio.checked) {
            return radio.value
        }
    }
    return undefined
}

function reloadJscolor() {
    jscolor.installByClassName("jscolor");
}

function reloadStateList() {
    var stateList = d3.select("#stateList").node()
    var selectedState = fvor("state")
    if (selectedState == undefined) {
        selectedState = "Unassigned"
    }
    stateList.innerHTML = ''
    var colLeft = stateList.appendChild(ned("div"))
    colLeft.style.height = "125px"
    colLeft.style.overflow = "auto"
    colLeft.className = "column left"
    var colRight = stateList.appendChild(ned("div"))
    colRight.className = "column right"
    var colNum = 0;
    for (var name in new_states) {
        colNum++
        var state = new_states[name]
        var nedt = (colNum % 2 != 0) ? colLeft : colRight
        var p = nedt.appendChild(ned("p"))
        var radio = p.appendChild(ned("input"))
        radio.type = "radio"
        radio.name = "state"
        radio.value = name
        radio.onclick = function() {
            selectedState = this.value
            var s = aggregateState(new_states[this.value])
            console.log(s)
            d3.select("#statePop").html("Population: ").append("b").html(s.population.total.toLocaleString())
            var table = d3.select("#statePolitics")
            var tbody = table.select("tbody")
            tbody.html('')
            var e16 = tbody.append("tr")
            e16.append("td").html('2016 Presidential Election')
            if (s.politics.presidential2016.dem > s.politics.presidential2016.gop) {
                e16.append("td").style("color", "darkblue").html("Clinton +" + s.politics.presidential2016.margin * -1)
            }
            else {
                e16.append("td").style("color", "darkred").html("Trump +" + s.politics.presidential2016.margin)
            }
            e16 = tbody.append('tr')
            e16.append("td").html("2012 Presidential Election")
            if (s.politics.presidential2012.dem > s.politics.presidential2012.gop) {
                e16.append("td").style("color", "darkblue").html("Obama +" + s.politics.presidential2012.margin * -1)
            }
            else {
                e16.append("td").style("color", "darkred").html("Romney +" + s.politics.presidential2012.margin)
            }
            e16 = tbody.append("tr")
            e16.append("td").html("")
            s.politics.swing = round(s.politics.swing, 2)
            if (s.politics.swing < 0) {
                e16.append("td").style("color", "darkblue").html("D +" + s.politics.swing * -1 + " Swing")
            }
            else {
                e16.append("td").style("color", "darkred").html("R +" + s.politics.swing + " Swing")
            }
            e16 = tbody.append("tr")
            e16.append("td").html("")
            s.politics.pvi = round(s.politics.pvi, 2)
            if (s.politics.pvi < 0) {
                e16.append("td").style("color", "darkblue").html("D +" + s.politics.pvi * -1 + " PVI")
            }
            else {
                e16.append("td").style("color", "darkred").html("R +" + s.politics.pvi + " PVI")
            }
        }
        if (name == selectedState) {
            radio.onclick()
            d3.select(radio).attr("checked", name == selectedState)
        }
        var staten = p.appendChild(ned("span"))
        staten.innerHTML = name
        if (name != "Unassigned") {
            staten.className = "underline fakeBtn"
            staten.onclick = function() {
                var modal = createModal().querySelector(".modalContent")
                var p = modal.appendChild(ned("p"))
                p.innerHTML = "State Name: "
                var tf = p.appendChild(ned("input"))
                d3.select(tf).attr("placeholder", staten.innerHTML)

                var btn = modal.appendChild(ned("button"))
                btn.innerHTML = "Rename State"
                btn.onclick = function() {
                    disposeModal(modal)
                    configState(staten.innerHTML, tf.value, state.color)
                }
                showModal(modal)
            }
        }
        p.appendChild(ned("br"))
        var input = p.appendChild(ned("input"))
        input.className = "jscolor"
        input.value = state.color
        var me2 = d3.select(input)
        me2.attr("state", name)
        d3.select(input).on("change", function() {
            var me3 = d3.select(this)
            configState(me3.attr("state"), me3.attr("state"), "#" + me3.node().value)
        })
    }
}

function aggregateState(state) {
    var s = {}
    s.population = {}
    s.politics = {
        presidential2012: {},
        presidential2016: {}
    }
    var totalPop = 0,
        tv16 = 0,
        tv12 = 0,
        d16 = 0,
        d12 = 0,
        r16 = 0,
        r12 = 0
    for (var i in state.counties) {

        totalPop += full_county_data[state.counties[i]].population.total
        if (full_county_data[state.counties[i]].meta.name.includes("Alaska")) continue
        if (full_county_data[state.counties[i]].meta.name.includes("Kalawao")) continue
        tv16 += full_county_data[state.counties[i]].politics.presidential2016.total
        tv12 += full_county_data[state.counties[i]].politics.presidential2012.total
        d16 += full_county_data[state.counties[i]].politics.presidential2016.dem
        d12 += full_county_data[state.counties[i]].politics.presidential2012.dem
        r16 += full_county_data[state.counties[i]].politics.presidential2016.gop
        r12 += full_county_data[state.counties[i]].politics.presidential2012.gop
        if (isNaN(d16)) {
            console.log(state.counties[i])
            return;
        }
    }
    s.politics.presidential2016.total = tv16
    s.politics.presidential2016.dem = d16
    s.politics.presidential2016.gop = r16
    s.politics.presidential2016.margin = roundPct((r16 - d16) / tv16, 2)
    s.politics.presidential2012.total = tv12
    s.politics.presidential2012.dem = d12
    s.politics.presidential2012.gop = r12
    s.politics.presidential2012.margin = roundPct((r12 - d12) / tv12, 2)
    s.politics.swing = s.politics.presidential2016.margin - s.politics.presidential2012.margin
    s.politics.pvi = s.politics.presidential2016.margin + s.politics.presidential2012.margin
    s.politics.pvi = s.politics.pvi / 2
    s.population.total = totalPop
    return s
}

function reloadMap() {
    console.log("reloads")
    for (var name in new_states) {
        for (var i in new_states[name].counties) {
            var countyId = new_states[name].counties[i]
            // console.log(countyId +" is part of " + name)
            // console.log(name+" color: " + new_states[name].color)
            d3.select("path#" + countyId).attr("fill", new_states[name].color)
            if (name != "Unassigned") {
                if (!d3.select("#showCounties").node().checked) {
                    d3.select("path#" + countyId).style("strokeWidth", "0.5px")
                    d3.select("path#" + countyId).style("stroke", "#" + new_states[name].color)
                }
            }
        }
    }
}

function reload() {
    reloadStateList()
    reloadMap()
    reloadJscolor()
}

function aiGen(no_states = 50, derv = 0.50) {
    for (var id in usMap.features) {
        var county = usMap.features[id]
        if (full_county_data["US" + county.id] == undefined) {
            console.log(county.id)
        }
        full_county_data["US" + county.id].neighbors = []
        for (var i in county.neighbors) {
            full_county_data["US" + county.id].neighbors.push("US" + county.neighbors[i].id)
        }
    }

    // link alaska to washington
    full_county_data.US53055.neighbors.push("US02198")
    full_county_data.US02198.neighbors.push("US53055")
    // link hawaii to california
    full_county_data.US06025.neighbors.push("US15001")
    full_county_data.US15001.neighbors.push("US06025")

    var os = {
        "State 1": {
            population: 0,
            counties: []
        },
    }
    var cs = "State 1"
    var csi = 1

    console.log("Beginning alogrithmic state generation")
    var counties = new_states["Unassigned"].counties
    console.log((counties).length + " counties to assign into " + no_states + " states")
    console.log("permitted population dervication: " + (derv * 100) + "%")
    var pps = round(aggregateState(new_states["Unassigned"]).population.total / no_states, 0)
    var lpps = round(pps - pps * derv, 0)
    var upps = round(pps + pps * derv, 0)
    console.log("Population Per State: " + pps.toLocaleString())
    console.log("\tLowerbound: " + lpps.toLocaleString())
    console.log("\tUpperbound: " + upps.toLocaleString())

    var touched = []
    var ntt = counties.length
    while (touched.length != ntt)
        for (var i in counties) {
            var county = full_county_data[counties[i]]
            var id = "US" + county.meta.id
            if (touched.includes(id)) continue
            touched.push(id)
            console.log("considering: " + county.meta.name)
            if (os[cs].population + county.population.total < upps) {
                touched.push("US"+county.meta.id)
                os[cs].counties.push("US"+county.meta.id)
                console.log("Added " + county.meta.name + " to " + cs)
            }
            else if (os[cs].population > lpps) {
                console.log("Complete state: " + cs)
                csi++
                cs = "State " + csi
                os[cs] = {
                    population: 0,
                    counties: []
                }
            }
        }
        
        return {
    generatedStates: os,
    touchedCounties: touched
}
}
