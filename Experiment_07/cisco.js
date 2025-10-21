/**
 * A class to represent a network packet.
 */
class Packet {
    constructor(sourceIp, destinationIp, content) {
        this.sourceIp = sourceIp;
        this.destinationIp = destinationIp;
        this.content = content;
        this.ttl = 32; // Time-to-live to prevent infinite loops
    }

    toString() {
        return `Packet from ${this.sourceIp} to ${this.destinationIp}`;
    }
}

/**
 * A class to represent a router.
 */
class Router {
    constructor(name) {
        this.name = name;
        // The routing table maps a destination network prefix to the next hop router.
        this.routingTable = new Map();
        // A map of directly connected neighbors.
        this.neighbors = new Map();
    }

    /**
     * Connect this router to another router (a neighbor).
     * @param {Router} neighborRouter - The router to connect to.
     */
    addNeighbor(neighborRouter) {
        this.neighbors.set(neighborRouter.name, neighborRouter);
        console.log(`INFO [${this.name}]: Established connection to neighbor ${neighborRouter.name}`);
    }

    /**
     * Simulates receiving a routing update (like from OSPF or RIP).
     * @param {string} networkPrefix - e.g., "192.168.2.0/24"
     * @param {string} nextHop - The name of the router that can reach this network.
     * @param {number} metric - A cost associated with the route.
     */
    receiveRoutingUpdate(networkPrefix, nextHop, metric = 1) {
        // In a real protocol, we'd compare metrics, but here we'll just accept the new route.
        console.log(`UPDATE [${this.name}]: Received route for ${networkPrefix} via ${nextHop}`);
        this.routingTable.set(networkPrefix, nextHop);
    }
    
    /**
     * Simulates sharing its own routing information with its neighbors.
     */
    advertiseRoutes() {
        console.log(`ADVERTISE [${this.name}]: Advertising its routes to all neighbors.`);
        for(const [prefix, nextHop] of this.routingTable.entries()) {
            for(const [neighborName, neighbor] of this.neighbors.entries()) {
                // Don't advertise a route back to the router you learned it from (split horizon)
                if(neighborName !== nextHop) {
                    neighbor.receiveRoutingUpdate(prefix, this.name);
                }
            }
        }
    }

    /**
     * Receives a packet and decides where to forward it.
     * @param {Packet} packet - The packet to be processed.
     */
    receivePacket(packet) {
        console.log(`RECEIVE [${this.name}]: Received ${packet}`);
        packet.ttl--;

        if (packet.ttl <= 0) {
            console.log(`DROP [${this.name}]: Packet TTL expired. Dropping.`);
            return;
        }

        const destinationNetwork = this.getNetworkPrefix(packet.destinationIp);

        if (this.routingTable.has(destinationNetwork)) {
            const nextHopRouterName = this.routingTable.get(destinationNetwork);
            if (this.neighbors.has(nextHopRouterName)) {
                const nextHopRouter = this.neighbors.get(nextHopRouterName);
                console.log(`FORWARD [${this.name}]: Forwarding packet for ${packet.destinationIp} to ${nextHopRouter.name}`);
                nextHopRouter.receivePacket(packet);
            } else {
                 console.log(`DELIVER [${this.name}]: Destination ${packet.destinationIp} is on a directly connected network. Delivered.`);
            }
        } else {
            console.log(`DROP [${this.name}]: No route to ${destinationNetwork}. Dropping packet.`);
        }
    }

    getNetworkPrefix(ip) {
        // Simple function to get a /24 network prefix.
        return ip.split('.').slice(0, 3).join('.') + '.0/24';
    }

    printRoutingTable() {
        console.log(`\n--- Routing Table for ${this.name} ---`);
        if (this.routingTable.size === 0) {
            console.log("Table is empty.");
        } else {
             this.routingTable.forEach((nextHop, network) => {
                console.log(`Destination: ${network} -> Next Hop: ${nextHop}`);
            });
        }
        console.log("----------------------------------\n");
    }
}


// --- Main Simulation ---
function runSimulation() {
    console.log("--- Initializing Network Simulation ---\n");

    // 1. Create Routers
    const R1 = new Router("R1");
    const R2 = new Router("R2");
    const R3 = new Router("R3");

    // 2. Establish neighbor connections (like plugging in cables)
    R1.addNeighbor(R2);
    R2.addNeighbor(R1);
    R2.addNeighbor(R3);
    R3.addNeighbor(R2);

    // 3. Define directly connected networks for each router
    R1.receiveRoutingUpdate("192.168.1.0/24", "R1"); // R1's own LAN
    R2.receiveRoutingUpdate("192.168.2.0/24", "R2"); // R2's own LAN
    R3.receiveRoutingUpdate("192.168.3.0/24", "R3"); // R3's own LAN

    console.log("\n--- Routing Tables Before Dynamic Updates ---");
    R1.printRoutingTable();
    R2.printRoutingTable();
    R3.printRoutingTable();

    // 4. Simulate Dynamic Routing Protocol Exchange
    console.log("\n--- Simulating OSPF Convergence ---\n");
    // In a real network, this happens automatically over several steps. We'll simplify.
    R1.advertiseRoutes();
    R3.advertiseRoutes();
    R2.advertiseRoutes(); // R2 advertises routes it learned from R1 and R3

    console.log("\n--- Routing Tables After Dynamic Updates ---");
    R1.printRoutingTable();
    R2.printRoutingTable();
    R3.printRoutingTable();

    // 5. Simulate sending a packet from PC1 to PC3
    console.log("\n--- Simulating Packet Transmission ---");
    const myPacket = new Packet("192.168.1.10", "192.168.3.15", "Hello World!");
    console.log(`Starting transmission of ${myPacket} from R1...`);
    R1.receivePacket(myPacket);

    console.log("\n--- Simulation Complete ---");
}

runSimulation();
