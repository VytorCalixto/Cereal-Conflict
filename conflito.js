'use strict'

const readline = require('readline')
const graph = require('./graph')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let g = new graph()
let transactions = []
let data = {}

rl.on('line', (line) => {
    // t é um array com a entrada
    var t = line.split(' ')
    transactions.push(t)
    let node = t[1]
    if(t[3] !== '-') {
        data[t[3]] = {
            read: [],
            write: []
        }
    }
    g.addNode(node)

}).on('close', () => {
    transactions.forEach((t)=>{
        // console.log(t)
        if(t[3] !== '-') {
            if(t[2] === 'R') {
                addRead(data, t)
            } else if(t[2] === 'W') {
                addWrite(data, t)
            }
        } else {
            commit(data, t)
        }
    })
    // console.log(data)
    console.log(g)
    checkCycle(g)
    process.exit(0)
})

function addRead(data, t) {
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

function addWrite(data, t) {
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

function checkCycle(graph) {
    let escalonamento = 0
    Object.keys(graph.nodes).forEach((node) => {
        let neighbors = graph.nodes[node]
        // console.log('node ' + node + ': ' + neighbors)
        if(neighbors.length > 0) {
            neighbors.forEach((neighbor) => {
                let result = graph.findPath(neighbor, node)
                // console.log('result:' + result)
                if(result !== null) {
                    let cycle = result.sort().join()
                    console.log(`${++escalonamento} ${cycle} NAO`)
                } else {
                    let cycle = neighbor+','+node
                    console.log(`${++escalonamento} ${cycle} SIM`)
                }
            })
        }
    })
}
