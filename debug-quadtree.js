import createQuadtree from './lib/quadtree'
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
  const self = {
    element,
    set: (k, v) => {
      element.setAttributeNS(null, k, v);
      return self;
    }
  };
  return self;
}

const nodes = []

while (nodes.length < 200) {
	nodes.push({
		x: -800 * Math.random() + 400,
		y: -800 * Math.random() + 400,
	})
}


const width = document.body.scrollWidth
const height = document.body.scrollHeight

const SVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
SVG.setAttributeNS(null, "width", width);
SVG.setAttributeNS(null, "height", height);
const CONTAINER = createSvgElement("g")
  .set("transform", `translate(${width/2}, ${height/2})`)
  .element;
SVG.appendChild(CONTAINER);
document.body.appendChild(SVG);



const quadtree = createQuadtree({ nodes })
quadtree.updateBoundingBox()
const bbox = quadtree.getBoundingBox()

const rect = createSvgElement("rect")
    .set("x", bbox.nw.x)
    .set("y", -1 * bbox.nw.y)
    .set("width", Math.abs(bbox.se.x - bbox.nw.x))
    .set("height", Math.abs(bbox.se.y - bbox.nw.y))
    .set("stroke", 'rgba(255, 0, 0, .4)')
    .set("stroke-width", '4')
    .set("fill", 'transparent')
CONTAINER.appendChild(rect.element);

for (const node of nodes) {
	node.svgElement = createSvgElement("circle")
	  .set("r", 2)
	  .set("fill", 'rgba(0, 0, 0, .7)')
	node.svgElement.set("cx", node.x)
	node.svgElement.set("cy", -1 * node.y)
	CONTAINER.appendChild(node.svgElement.element)
}

let svgElement = createSvgElement("circle")
  .set("r", 5)
  .set("fill", 'rgba(255, 0, 0, 1)')
svgElement.set("cx", 0)
svgElement.set("cy", 0)
CONTAINER.appendChild(svgElement.element)




function updateLoop() {
	quadtree.updateBoundingBox()

	//console.log(quadtree.getBoundingBox())

	const dt = quadtree.update()

	for (const bbox of quadtree.getComputedBoxes()) {
		const rect = createSvgElement("rect")
		    .set("x", bbox.nw.x)
		    .set("y", -1 * bbox.nw.y)
		    .set("width", Math.abs(bbox.se.x - bbox.nw.x))
		    .set("height", Math.abs(bbox.se.y - bbox.nw.y))
		    .set("stroke", 'rgba(0, 0, 255, .4)')
		    .set("stroke-width", '4')
		    .set("fill", 'rgba(0, 0, 255, .1)')
		CONTAINER.appendChild(rect.element);
	}

	return
	fpsCounter.innerHTML = 'FPS: ' + Math.floor(1/(dt/1000))
	nodeCounter.innerHTML = 'NODES: ' + nodes.length

	requestAnimationFrame(updateLoop)
}
updateLoop()

setTimeout(() => {
  const zoom = window.zoom = svgPanZoom(SVG, {
    minZoom: .00001,
    maxZoom: 2,
    zoomScaleSensitivity: .5,
    fit: false,
    contain: false,
    center: false,
  });
  zoom.zoom(.5)
}, 200)