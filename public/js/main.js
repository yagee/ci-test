"serviceWorker"in navigator&&window.addEventListener("load",function(){navigator.serviceWorker.register("service-worker.js").then(function(n){n.onupdatefound=function(){var e=n.installing;e.onstatechange=function(){switch(e.state){case"installed":navigator.serviceWorker.controller?console.log("New or updated content is available."):console.log("Content is now available offline!");break;case"redundant":console.error("The installing service worker became redundant.")}}}}).catch(function(e){console.error("Error during service worker registration:",e)})});