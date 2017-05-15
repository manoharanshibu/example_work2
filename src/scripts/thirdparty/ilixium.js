/*******************************************************************************
 * Copyright (c) 2013-2014 Ilixium. All rights reserved.
 *******************************************************************************/

function a(h, i) {
	var g = document.createElement("input");
	g.setAttribute("type", "hidden");
	g.setAttribute("name", h);
	g.value = i;
	return g
}

function d() {
	var i = document.getElementsByTagName("meta");
	for (var g = 0; g < i.length; g++) {
		var h = i[g];
		if (h.getAttribute && h.getAttribute("name") === "viewport") {
			return h
		}
	}
	return false
}

function b(g) {
	while (g.indexOf(" ") >= 0) {
		g = g.replace(/\s/, "")
	}
	return g
}

function c() {
	var g = d();
	if (g) {
		var j = g.getAttribute("content");
		window._ilx_oldviewport = j;
		var l = j.split(",")
			, h = false
			, i = false;
		for (var k = 0; k < l.length; k++) {
			if (b(l[k]).indexOf("user-scalable=") >= 0) {
				l[k] = "user-scalable=no";
				h = true
			} else {
				if (b(l[k]).indexOf("width=") >= 0) {
					l[k] = "width=device-width";
					i = true
				}
			}
			if (h && i) {
				break
			}
		}
		if (!h) {
			l.push("user-scalable=no")
		}
		if (!i) {
			l.push("width=device-width")
		}
		if (!g.getAttribute("id")) {
			g.setAttribute("id", "_viewport" + new Date().getTime())
		}
		g.setAttribute("content", l.join(","))
	} else {
		window._ilx_destroyviewport = true;
		g = document.createElement("meta");
		g.setAttribute("name", "viewport");
		g.setAttribute("content", "width=device-width,user-scalable=no");
		g.setAttribute("id", "_viewport" + new Date().getTime());
		document.head.appendChild(g)
	}
}

function f(h) {
	var g = d();
	if (g) {
		if (window._ilx_oldviewport) {
			g.setAttribute("content", window._ilx_oldviewport);
			window._ilx_oldviewport = null
		} else {
			if (window._ilx_destroyviewport) {
				document.head.removeChild(g);
				window._ilx_destroyviewport = false
			}
		}
	}
}

function e(i, l) {
	c();
	var h = document.createElement("div");
	h.className = "ilixium-blanket";
	h.setAttribute("id", "ilixium-blanket");
	document.body.appendChild(h);
	var k = document.createElement("form");
	k.className = "ilixium-iframe-form";
	k.setAttribute("id", "ilixium-iframe-form");
	k.setAttribute("method", "post");
	k.setAttribute("action", i);
	k.setAttribute("target", "ilixium-iframe");
	for (var g in l) {
		k.appendChild(a(g, l[g]))
	}
	document.body.appendChild(k);
	var j;
	try {
		j = document.createElement("<iframe name='ilixium-iframe'></iframe>")
	} catch (m) {
		j = document.createElement("iframe");
		j.setAttribute("name", "ilixium-iframe")
	}
	j.setAttribute("id", "ilixium-iframe");
	j.setAttribute("allowTransparency", "true");
	j.setAttribute("marginheight", "0");
	j.setAttribute("marginwidth", "0");
	j.setAttribute("frameborder", "0");
	j.setAttribute("border", "0");
	j.className = "ilixium-iframe";
	j.frameBorder = "0";
	document.body.appendChild(j);
	k.submit()
}

export const launch = function (g, j, h, i) {
	e(g, {
		merchantId: j,
		requestKey: h,
		digest: i
	})
}

export const launchFromThirdPartyReturn = function (g, q) {
	if (arguments.length > 2) {
		var p = {};
		for (var n = 1; n < arguments.length; n = n + 2) {
			if (n + 1 < arguments.length && "string" === typeof arguments[n]) {
				p[arguments[n]] = arguments[n + 1]
			}
		}
		e(g, p)
	} else {
		if ("object" === typeof q) {
			e(g, q)
		} else {
			if ("string" === typeof q) {
				if (q.indexOf("#") == 0) {
					var j = document.getElementById(q.substring(1));
					q = {};
					if (j) {
						var k = j.childNodes;
						for (var n = 0; n < k.length; n++) {
							if (k[n].nodeType == 1 && k[n].tagName.toLowerCase() === "input") {
								var h = k[n].getAttribute("name");
								var o = k[n].value;
								if (h) {
									q[h] = o
								}
							}
						}
					}
					e(g, q)
				} else {
					var m = q.split("&");
					q = {};
					for (var n = 0; n < m.length; n++) {
						var l = m[n].indexOf("=");
						if (l > 0) {
							q[decodeURIComponent(m[n].substring(0, l))] = decodeURIComponent(m[n].substring(l + 1))
						}
					}
					e(g, q)
				}
			} else {
				e(g, {})
			}
		}
	}
}

export const close = function () {
	document.body.removeChild(document.getElementById("ilixium-blanket"));
	document.body.removeChild(document.getElementById("ilixium-iframe-form"));
	document.body.removeChild(document.getElementById("ilixium-iframe"));
	f()
}
