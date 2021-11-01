// eslint-disable-next-line no-restricted-globals
self.onmessage = e => {
  console.log(e.data);
  postMessage("Polo!");
};
