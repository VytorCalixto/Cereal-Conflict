#!/usr/bin/nodejs
'use strict'

const readline = require('readline')
const graph = require('./graph')

// Cria a interface para ler do STDIN
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    // Seta em falso para não imprimir a entrada
    terminal: false
})

// Escalonamentos
let schedules = {}
// Número do escalonamento
let schedule = 0

rl.on('line', (line) => {
    // Se o escalonamento existe
    if(typeof schedules[schedule] !== 'undefined') {
        // Se todas as transações do escalonamento já comitaram,
        // cria um novo escalonamento
        if(schedules[schedule].allCommit) {
            schedules[++schedule] = {
                // número do escalonamento
                s: schedule,
                allCommit: false,
                // número de commits
                commitCount: 0,
                // grafo
                g: new graph(),
                // dados acessados
                data: {},
                // transações
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

    // t é um array com a entrada
    let t = line.split(' ')
    // adiciona t a lista de transações
    schedules[schedule].operations.push(t)
    // cria um nodo com o identificador da transação
    schedules[schedule].g.addNode(t[1])
    // Se não é um commit
    if(t[3] !== '-') {
        // cria a estrutura para verificar a leitura e escrita nos dados
        schedules[schedule].data[t[3]] = {
            read: [],
            write: []
        }
    } else {
        // se é um commit, verifica se todas as transações já commitaram
        schedules[schedule].commitCount++
        schedules[schedule].allCommit = (schedules[schedule].commitCount === schedules[schedule].g.nodeCount())
    }

}).on('close', () => {
    // Para cada escalonamento
    Object.keys(schedules).forEach((s) => {
        let schdl = schedules[s]
        schdl.commitCount = 0;
        // Para cada transação
        schdl.operations.forEach((t) => {
            if(t[3] !== '-') {
                if(t[2] === 'R') {
                    // Faz a leitura
                    addRead(schdl.data, t, schdl.g)
                } else if(t[2] === 'W') {
                    // Faz a escrita
                    addWrite(schdl.data, t, schdl.g)
                }
            } else {
                // Faz o commit (apaga os dados)
                commit(schdl.data, t)
                ++schdl.commitCount
            }
        })
        // Checa conflito para aquele escalonamento
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
