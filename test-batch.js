function translatePageNodesBatch() {
  const nodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if (["SCRIPT", "STYLE", "PRE", "CODE", "NOSCRIPT"].includes(node.parentNode.nodeName)) return NodeFilter.FILTER_REJECT;
      if (node.textContent.trim().length > 2) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    }
  });

  while (walker.nextNode()) nodes.push(walker.currentNode);
  
  // we can do a mock here to see how it looks
}
