// let worker = new Worker("../lib/worker.js");

// worker.onmessage = function(e) {
//   console.log(e.data);
// };

// worker.addEventListener("error", function(event) {
//   console.error("error worker:", event);
// });

// worker.postMessage("Marco!");

import { invSqrt } from "fast-inv-sqrt";
import createQuadtree from "./quadtree";

const POINTS_BY_QUAD_BOX = 10

function pickRandom(items, prevalence) {
  const picked = []

  for (const item of items) {
    if (Math.random() < prevalence) {
      picked.push(item)
    }
  }

  return picked
}


function engine({ nodes, links }) {
  let tickCounter = 0
  const quadtree = createQuadtree({ nodes, maxNodesPerGroup: POINTS_BY_QUAD_BOX })

  for (const node of nodes) {
    node.x = Math.random() * 1000;
    node.y = Math.random() * 1000;

    node.linkedWith = []

    // node.vx = 0;
    // node.vy = 0;

    node.lastVectors = [{ dx: 0, dy: 0 }]
  }

  for (const link of links) {
    link.target.linkedWith.push(link.source)
    link.source.linkedWith.push(link.target)
  }


  function getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    //return invSqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    //return Math.abs(a.x-b.x-a.y-b.y)*4
  }

  function getSingleRepulseForceVector(node, target) {
    //https://www.desmos.com/calculator/9qediehvs8
    //const factor = (-1 * 1) / (1 + Math.pow(getDistance(node, target), 2));
    //let factor = -1/(1 + Math.pow(distance, 2))
    
    const distance = getDistance(node, target)
    let factor = 
      .00001
      * 
      20*(-100/(Math.pow(distance, 2.5)/1000 + 3))
      //20*(-500/(distance*distance))

    return {
      dx: (target.x - node.x) * factor,
      dy: (target.y - node.y) * factor
    };
  }

  function getSingleAttractForceVector(node, target) {
    //let factor = (1 * 2) / (1 + Math.pow(getDistance(node, target), 1.2))
    //let factor = 1/(1 + Math.pow(distance, 1.2))

    const distance = getDistance(node, target)
    let factor = 
      .00001
      * 
      20 * (-1000/(Math.pow(distance, 3)/4000 + 3) + 20)
      //20 * (30 + -5000000/(distance*distance*distance))


    
    // if (distance < 150) {
    //   factor = 0
    // }
    

    /*
    if (getDistance(node, target) < 50) {
      factor = factor * .01
    } 

    if (getDistance(node, target) > 100) {
      factor = factor * 10
    }
    */

    //console.log(getDistance(node, target))

    return {
      dx: (target.x - node.x) * factor,
      dy: (target.y - node.y) * factor
    };
  }

  function getForceVector(node) {
    if (node.fx && node.fy) {
      return { dx: 0, dy: 0 };
    }

    let sumDx = 0,
      sumDy = 0;

    const maxChecks = 50
    let checks = 0


    for (const linkedNode of node.linkedWith) {
        var { dx, dy } = getSingleAttractForceVector(node, linkedNode);
        sumDx += dx;
        sumDy += dy;

        var { dx, dy } = getSingleRepulseForceVector(node, linkedNode);
        sumDx += dx;
        sumDy += dy;

    }

    for (const bbox of quadtree.getComputedBoxes()) {
      if (quadtree.helpers.boxContainsPoint(bbox, node)) {
        continue
        //console.log('contains')
      }
      let { dx, dy } = getSingleRepulseForceVector(node, quadtree.helpers.getCenterOfBox(bbox));
      sumDx += POINTS_BY_QUAD_BOX * dx;
      sumDy += POINTS_BY_QUAD_BOX * dy;
      //debugger
    }
    // debugger

    // for (const neighbor of nodes) {
    //   if (node == neighbor) {
    //     continue
    //   }

    //   const hasLink = links.find((link) => {
    //     if (link.source == node && link.target == neighbor) {
    //       return true
    //     }
    //     if (link.source == neighbor && link.target == node) {
    //       return true
    //     }
    //     return false
    //   })

    //   if (hasLink) {
    //     let { dx, dy } = getSingleAttractForceVector(node, neighbor);
    //     sumDx += dx;
    //     sumDy += dy;
    //   }

    //   let { dx, dy } = getSingleRepulseForceVector(node, neighbor);
    //   sumDx += dx;
    //   sumDy += dy;

    //   checks++
    // }

    return { dx: sumDx, dy: sumDy };
  }

  let lastTickDate = null;

  function tick() {
    tickCounter++
    const computeSpeed = Math.sqrt(Math.max(1, 200 - tickCounter))
    //const computeSpeed = 2

    if (tickCounter%1 == 0) {
      quadtree.updateBoundingBox()
      quadtree.update()
    }

    if (!lastTickDate) {
      lastTickDate = new Date().getTime();
      return;
    }

    const now = new Date().getTime();
    const dt = now - lastTickDate;


    for (const node of nodes) {
      // if (tickCounter > 50 && Math.random() > .3) {
      //   continue
      // }

      let { dx, dy } = getForceVector(node);

      
      // const DAMPING = 5
      // node.lastVectors.push({
      //   dx, dy
      // })
      // node.lastVectors = node.lastVectors.slice(-10)

      // node.lastVectors = node.lastVectors.slice(-1 * DAMPING)
      // dx = node.lastVectors.map(i => i.dx).reduce((a, b) => a + b) / DAMPING
      // dy = node.lastVectors.map(i => i.dy).reduce((a, b) => a + b) / DAMPING
      
      
      
      const MAX_MOVE = 5/dt
      dx = Math.max(Math.min(dx, MAX_MOVE), -1 * MAX_MOVE)
      dy = Math.max(Math.min(dy, MAX_MOVE), -1 * MAX_MOVE)

      node.x += dx * dt * computeSpeed;
      node.y += dy * dt * computeSpeed;
    }

    lastTickDate = now;
    return dt
  }

  return {
    tick,
    quadtree
  };
}

export default engine;
