'use strict'

const readline = require('readline')
const graph = require('./graph')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})

let schedules = {}
let schedule = 0

rl.on('line', (line) => {
    if(typeof schedules[schedule] !== 'undefined') {
        if(schedules[schedule].allCommit) {
            schedules[++schedule] = {
                s: schedule,
                allCommit: false,
                commitCount: 0,
                g: new graph(),
                data: {},
                operations: []
            }
        }
    }
    if(schedule === 0) {
        schedules[++schedule] = {
            s: schedule,
            allCommit: false,
            commitCount: 0,
            g: new graph(),
            data: {},
            operations: []
        }
    }

    let t = line.split(' ')
    schedules[schedule].operations.push(t)
    schedules[schedule].g.addNode(t[1])
    if(t[3] !== '-') {
        schedules[schedule].data[t[3]] = {
            read: [],
            write: []
        }
    } else {
        schedules[schedule].commitCount++
        schedules[schedule].allCommit = (schedules[schedule].commitCount === schedules[schedule].g.nodeCount())
    }
    // console.log(schedules)

}).on('close', () => {
    Object.keys(schedules).forEach((s) => {
        // console.log('Schedule ' + s)
        // console.log(schedules[s])
        let schdl = schedules[s]
        schdl.commitCount = 0;
        schdl.operations.forEach((t) => {
            if(t[3] !== '-') {
                if(t[2] === 'R') {
                    addRead(schdl.data, t, schdl.g)
                } else if(t[2] === 'W') {
                    addWrite(schdl.data, t, schdl.g)
                }
            } else {
                commit(schdl.data, t)
                ++schdl.commitCount
            }
        })
        // console.log(schdl.g)
        checkConflict(schdl)
    })
    process.exit(0)
})

function addRead(data, t, g) {
    if(data[t[3]].read.indexOf(t[1]) === -1)
        data[t[3]].read.push(t[1])
    if(data[t[3]].write.length > 0) {
        data[t[3]].write.forEach((d) => {
            // console.log('rd: '+d)
            if(d !== t[1]) {
                g.createArch(d, t[1])
            }
        })
    }
}

function addWrite(data, t, g) {
    if(data[t[3]].write.indexOf(t[1]) === -1)
        data[t[3]].write.push(t[1])
    if(data[t[3]].read.length > 0) {
        data[t[3]].read.forEach((d) => {
            // console.log('wd: ' + d)
            if(d !== t[1]) {
                g.createArch(d, t[1])
            }
        })
    }
}

function commit(data, t) {
    // console.log('commit ' + t)
    Object.keys(data).forEach((key) => {
        let d = data[key]
        // console.log(d)
        removeFromArray(d.read, t[1])
        removeFromArray(d.write, t[1])
    })
}

function removeFromArray(arr, el) {
    let index = arr.indexOf(el)
    if(index > -1) arr.splice(index, 1)
}

function checkConflict(schdl) {
    let graph = schdl.g
    let conflict = false
    Object.keys(graph.nodes).forEach((node) => {
        let neighbors = graph.nodes[node]
        // console.log('node ' + node + ': ' + neighbors)
        if(neighbors.length > 0) {
            neighbors.forEach((neighbor) => {
                let result = graph.findPath(neighbor, node)
                // console.log('result:' + result)
                let cycle = Object.keys(graph.nodes).sort().join() //result.sort().join()
                conflict = (result !== null)
                // if(result !== null) {
                //     console.log(`${schdl.s} ${cycle} NAO`)
                // } else {
                //     console.log(`${schdl.s} ${cycle} SIM`)
                // }
            })
        }
    })
    let cycle = Object.keys(graph.nodes).sort().join()
    if(conflict) console.log(`${schdl.s} ${cycle} NAO`)
    else console.log(`${schdl.s} ${cycle} SIM`)
}
