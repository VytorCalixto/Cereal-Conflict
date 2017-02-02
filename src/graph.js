'use strict'

/**
 * Classe do grafo
 */
class Graph {
    /**
     * Construtor
     * @type {Object}
     */
    constructor(nodes = {}) {
        this.nodes = nodes
    }

    /**
     * Adiciona um nodo ao grafo
     */
    addNode(node) {
        if(typeof this.nodes[node] === 'undefined') {
            this.nodes[node] = []
        }
    }

    /**
     * Cria um arco no grafo de tail até head
     */
    createArch(tail, head) {
        if(this.nodes[tail].indexOf(head) === -1)
            this.nodes[tail].push(head)
    }

    /**
     * Procura um caminho entre dois nodos. Usa backtracking
     * @type {Array}
     */
    findPath(start, end, path = []) {
        path = path.concat([start])
        if(start === end) return path
        if(typeof this.nodes[start] === 'undefined') return null
        let neighbors = this.nodes[start];
        for(var i=0; i<neighbors.length; ++i) {
            let node = neighbors[i];
            if(path.indexOf(node) === -1) {
                let newpath = this.findPath(node, end, path)
                if(newpath !== null)
                    return newpath
            }
        }
        return null
    }

    /**
     * Retorna o número de nodos
     */
    nodeCount() {
        return Object.keys(this.nodes).length
    }
}

module.exports = Graph;
