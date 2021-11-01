function quadtree({ nodes, maxNodesPerGroup = 5 }) {
	let computedBoxes = []
	let lastUpdate = new Date().getTime()

	const boundingBox = {
        nw: { x: 0, y: 0 }, 
        se: { x: 0, y: 0 }, 
		// ne: { x: 0, y: 0 }, 
  //       sw: { x: 0, y: 0 }
	}

	function splitBox(bbox) {
		const boxes = []
		
		const nw = bbox.nw
		const segmentWidth = Math.max(bbox.se.x - bbox.nw.x, bbox.nw.y - bbox.se.y) / 2
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				boxes.push({
					nw: { 
						x: bbox.nw.x + i * segmentWidth,
						y: bbox.nw.y + -j * segmentWidth
					},
					se: {
						x: bbox.nw.x + (i + 1) * segmentWidth,
						y: bbox.nw.y + (-j - 1) * segmentWidth
					}
				})
			}	
		}
		return boxes
	}

	function countNodesInsideBox(bbox) {
		return (nodes.filter((node) => {
			//return true
			// console.log(
			// 	node.x, bbox.nw.x,
			// 	node.y, bbox.nw.y,
			// 	node.x, bbox.se.x,
			// 	node.y, bbox.se.y,
			// 	(node.x > bbox.nw.x && node.y < bbox.nw.y && node.x <= bbox.se.x && node.y >= bbox.se.y)
			// )
			return (node.x >= bbox.nw.x && node.y <= bbox.nw.y && node.x <= bbox.se.x && node.y >= bbox.se.y)
		}).length)

	}

	function fillBoxes(bbox, foundBoxes) {
		const nodesInside = countNodesInsideBox(bbox)
		// console.log(nodesInside, bbox)
		if (nodesInside == 0) {
			return
		}
		if (nodesInside <= maxNodesPerGroup) {
			foundBoxes.push(bbox)
			return
		}
		for (const subBox of splitBox(bbox)) {
			//console.log(subBox)
			fillBoxes(subBox, foundBoxes)
		}
	}

	return {
		helpers: {
			getCenterOfBox(bbox) {
				return {
					x: (bbox.nw.x + bbox.se.x)/2,
					y: (bbox.nw.y + bbox.se.y)/2,
				}
			},
			boxContainsPoint(bbox, point) {
				return (point.x >= bbox.nw.x && point.y <= bbox.nw.y && point.x <= bbox.se.x && point.y >= bbox.se.y)
			}
		},
		getComputedBoxes() {
			return computedBoxes
		},
		getBoundingBox() {
			return boundingBox
		},
		updateBoundingBox() {
			const minX = Math.min(...nodes.map(n => n.x))
			const minY = Math.min(...nodes.map(n => n.y))
			const maxX = Math.max(...nodes.map(n => n.x))
			const maxY = Math.max(...nodes.map(n => n.y))

			boundingBox.nw.x = minX
			boundingBox.nw.y = maxY

			// boundingBox.ne.x = maxX
			// boundingBox.ne.y = minY

			// boundingBox.sw.x = minX
			// boundingBox.sw.y = minY

			boundingBox.se.x = maxX
			boundingBox.se.y = minY
		},
		update() {
			computedBoxes = []
			fillBoxes(boundingBox, computedBoxes)
			// console.log(computedBoxes)


			// const box = {
		 //        nw: { x: 200, y: 200 }, 
		 //        se: { x: 400, y: 0 }, 
			// }
			// computedBoxes = [box, ...splitBox(box)]

			// computedBoxes = [splitBox(box)[3]]
			// computedBoxes = [box]

			// const box = 
			// computedBoxes.push(box)


			const now = new Date().getTime()
			const dt = now - lastUpdate
			lastUpdate = now
			return dt;
		}
	}
}

export default quadtree