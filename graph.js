'use strict'

class Graph {
    constructor(nodes = {}) {
        this.nodes = nodes
    }

    addNode(node) {
        if(typeof this.nodes[node] === 'undefined') {
            this.nodes[node] = []
        }
    }

    createArch(tail, head) {
        if(this.nodes[tail].indexOf(head) === -1)
            this.nodes[tail].push(head)
    }

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
}

function findPathCallback() {
    return null
}

module.exports = Graph;
