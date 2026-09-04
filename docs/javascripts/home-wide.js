document$.subscribe(function() {
  var path = location.pathname;
  if (path === "/metaage/" || path.endsWith("/metaage/index.html")) {
    document.body.classList.add("home-wide");
  } else {
    document.body.classList.remove("home-wide");
  }
});
