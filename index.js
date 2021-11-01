import "./styles.css";
import graphEngine from "./lib/graph-engine";
import svgPanZoom from "svg-pan-zoom";

setInterval(() => {
  document.title = window.performance.memory.usedJSHeapSize / 1000000
}, 1000)

const fpsCounter = document.createElement('div')
fpsCounter.style.position = 'absolute'
fpsCounter.style.right = '0'
fpsCounter.style.top = '0'
document.body.appendChild(fpsCounter)

const nodeCounter = document.createElement('div')
nodeCounter.style.position = 'absolute'
nodeCounter.style.right = '100px'
nodeCounter.style.top = '0'
document.body.appendChild(nodeCounter)



function createSvgElement(type) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", type);
  /*
  element.setAttributeNS(null, "id", "mycircle");
  element.setAttributeNS(null, "cx", 100);
  element.setAttributeNS(null, "cy", 100);
  myCircle.setAttributeNS(null, "r", 50);
  myCircle.setAttributeNS(null, "fill", "black");
  myCircle.setAttributeNS(null, "stroke", "none");
  */

  const self = {
    element,
    set: (k, v) => {
      element.setAttributeNS(null, k, v);
      return self;
    }
  };

  return self;
}

/*
const nodes = [
  { name: "1", fx: 0, fy: 0 },
  { name: "2" },
  { name: "3" },
  { name: "4" },
  { name: "5" }
];

const links = [
  { source: nodes[0], target: nodes[1] },
  { source: nodes[0], target: nodes[2] },
  { source: nodes[2], target: nodes[3] }
];
*/

const nodes = []
const links = []

const maxTotalNodes = 3000000
const maxDepth = 8

function createNode(color = 'red') {
  return { name: 'lol', color }
}

function injectChildren(parentNode, min = 0, depth = 0) {
  if (nodes.length >= maxTotalNodes) {
    return
  }
  if (depth >= maxDepth) {
    return
  }
  const count = min + Math.floor(Math.random() * 5)
  const children = []
  for (let i = 0; i < count; i++) {
    const newNode = createNode()
    nodes.push(newNode)
    links.push({
      source: parentNode,
      target: newNode
    })
    children.push(newNode)
    //injectChildren(newNode)
  }
  
  for (const child of children) {
    injectChildren(child, 0, depth + 1)
  }
}

const node = createNode('blue')
node.fx = 1
node.fy = 1
nodes.push(node)
injectChildren(node, 3)

nodeCounter.innerHTML = 'NODES : ' + nodes.length




const engine = graphEngine({
  nodes,
  links
});

const width = document.body.scrollWidth
const height = document.body.scrollHeight

const SVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
SVG.setAttributeNS(null, "width", width);
SVG.setAttributeNS(null, "height", height);
const CONTAINER = createSvgElement("g")
  //.set("transform", `translate(${width/2}, ${height/2})`)
  .element;
SVG.appendChild(CONTAINER);
document.body.appendChild(SVG);


const animationLoop = requestAnimationFrame
// const animationLoop = fn => setTimeout(fn, 1000/120)

function update() {
  const dt = engine.tick();
  fpsCounter.innerHTML = 'FPS: ' + Math.floor(1/(dt/1000))
  //console.log(engine.positions);
  for (const node of nodes) {
    if (!node.svgElement) {
      node.svgElement = createSvgElement("circle")
        .set("r", 10)
        .set("fill", node.color);
      CONTAINER.appendChild(node.svgElement.element);
    }
    node.svgElement.set("cx", node.x);
    node.svgElement.set("cy", -node.y);
  }

  for (const link of links) {
    if (!link.svgElement) {
      link.svgElement = createSvgElement("line")
        .set("stroke", 'red')
        .set("stroke-width", "2");
      CONTAINER.appendChild(link.svgElement.element);
    }
    link.svgElement.set("x1", link.source.x);
    link.svgElement.set("y1", -link.source.y);
    link.svgElement.set("x2", link.target.x);
    link.svgElement.set("y2", -link.target.y);
  }

  document.querySelectorAll(".quadtree-bboxes").forEach(i => i.remove())
  for (const bbox of engine.quadtree.getComputedBoxes()) {
    var rect = createSvgElement("rect")
        .set("class", 'quadtree-bboxes')
        .set("x", bbox.nw.x)
        .set("y", -1 * bbox.nw.y)
        .set("width", Math.abs(bbox.se.x - bbox.nw.x))
        .set("height", Math.abs(bbox.se.y - bbox.nw.y))
        .set("stroke", 'rgba(0, 0, 255, .4)')
        .set("stroke-width", '4')
        .set("fill", 'rgba(0, 0, 255, .05)')
    CONTAINER.appendChild(rect.element);
  }

  document.querySelectorAll(".quadtree-bbox").forEach(i => i.remove())
  const globalBbox = engine.quadtree.getBoundingBox()
  var rect = createSvgElement("rect")
        .set("class", 'quadtree-bboxes')
        .set("x", globalBbox.nw.x)
        .set("y", -1 * globalBbox.nw.y)
        .set("width", Math.abs(globalBbox.se.x - globalBbox.nw.x))
        .set("height", Math.abs(globalBbox.se.y - globalBbox.nw.y))
        .set("stroke", 'rgba(255, 0, 0., .4)')
        .set("stroke-width", '4')
        .set("fill", 'rgba(255, 0, 0, .05)')
    CONTAINER.appendChild(rect.element);

  animationLoop(update);
}

update();

setTimeout(() => {
  const zoom = window.zoom = svgPanZoom(SVG, {
    minZoom: .00001,
    maxZoom: 2,
    zoomScaleSensitivity: .5,
    fit: false
  });
  zoom.zoom(.5)
}, 200)