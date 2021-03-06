! function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.ContextMenu = t()
}(this, function () {
    "use strict";
    ! function (e, t) {
        void 0 === t && (t = {});
        var n = t.insertAt;
        if (e && "undefined" != typeof document) {
            var i = document.head || document.getElementsByTagName("head")[0],
                o = document.createElement("style");
            o.type = "text/css", "top" === n && i.firstChild ? i.insertBefore(o, i.firstChild) : i.appendChild(o), o.styleSheet ? o.styleSheet.cssText = e : o.appendChild(document.createTextNode(e))
        }
    }(".ContextMenu{display:none;list-style:none;margin:0;max-width:250px;min-width:125px;padding:0;position:absolute;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ContextMenu--theme-default{background-color:#fff;border:1px solid rgba(0,0,0,.2);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.15);box-shadow:0 2px 5px rgba(0,0,0,.15);font-size:13px;outline:0;padding:2px 0}.ContextMenu--theme-default .ContextMenu-item{padding:6px 12px}.ContextMenu--theme-default .ContextMenu-item:focus,.ContextMenu--theme-default .ContextMenu-item:hover{background-color:rgba(0,0,0,.05)}.ContextMenu--theme-default .ContextMenu-item:focus{outline:0}.ContextMenu--theme-default .ContextMenu-divider{background-color:rgba(0,0,0,.15)}.ContextMenu.is-open{display:block}.ContextMenu-item{cursor:pointer;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ContextMenu-divider{height:1px;margin:4px 0}");
    var e = [],
        t = 0,
        open = false;

    function n(e, t, n) {
        void 0 === n && (n = {});
        var i = document.createEvent("Event");
        Object.keys(n).forEach(function (e) {
            i[e] = n[e]
        }), i.initEvent(t, !0, !0), e.dispatchEvent(i)
    }
    Element.prototype.matches || (Element.prototype.matches = Element.prototype.msMatchesSelector);
    var i = function (n, i, o) {
        void 0 === o && (o = {
            className: "",
            minimalStyling: !1
        }), this.selector = n, this.items = i, this.options = o, this.id = t++ , this.target = null, this.create(), e.push(this)
    };
    return i.prototype.create = function () {
        var e = this;
        this.menu = document.createElement("ul"), this.menu.className = "ContextMenu", this.menu.setAttribute("data-contextmenu", this.id), this.menu.setAttribute("tabindex", -1), this.menu.addEventListener("keyup", function (t) {
            switch (t.which) {
                case 38:
                    e.moveFocus(-1);
                    break;
                case 40:
                    e.moveFocus(1);
                    break;
                case 27:
                    e.hide()
            }
        }), this.options.minimalStyling || this.menu.classList.add("ContextMenu--theme-default"), this.options.className && this.options.className.split(" ").forEach(function (t) {
            return e.menu.classList.add(t)
        }), this.items.forEach(function (t, n) {
            var i = document.createElement("li");
            "name" in t ? (i.className = "ContextMenu-item", i.textContent = t.name, i.setAttribute("data-contextmenuitem", n), i.setAttribute("tabindex", 0), i.addEventListener("click", e.select.bind(e, i)), i.addEventListener("keyup", function (t) {
                13 === t.which && e.select(i)
            })) : i.className = "ContextMenu-divider", e.menu.appendChild(i)
        }), document.body.appendChild(this.menu), n(this.menu, "created")
    }, i.prototype.show = function (e) {
        this.menu.style.left = (e.pageX) + "px", this.menu.style.top = (e.pageY) + "px", this.menu.classList.add("is-open"), this.target = e.target, this.menu.focus(), e.preventDefault(), n(this.menu, "shown")
    }, i.prototype.hide = function () {
        this.menu.classList.remove("is-open"), this.target = null, n(this.menu, "hidden")
    }, i.prototype.select = function (e) {
        var t = e.getAttribute("data-contextmenuitem");
        this.items[t] && this.items[t].fn(this.target), this.hide(), n(this.menu, "itemselected")
    }, i.prototype.moveFocus = function (e) {
        void 0 === e && (e = 1);
        var t, n = this.menu.querySelector("[data-contextmenuitem]:focus");
        n && (t = function e(t, n, i) {
            void 0 === i && (i = 1);
            var o = i > 0 ? t.nextElementSibling : t.previousElementSibling;
            return !o || o.matches(n) ? o : e(o, n, i)
        }(n, "[data-contextmenuitem]", e)), t || (t = e > 0 ? this.menu.querySelector("[data-contextmenuitem]:first-child") : this.menu.querySelector("[data-contextmenuitem]:last-child")), t && t.focus()
    }, i.prototype.on = function (e, t) {
        this.menu.addEventListener(e, t)
    }, i.prototype.off = function (e, t) {
        this.menu.removeEventListener(e, t)
    }, i.prototype.destroy = function () {
        this.menu.parentElement.removeChild(this.menu), this.menu = null, e.splice(e.indexOf(this), 1)
    }, document.addEventListener("contextmenu", function (t) {
        e.forEach(function (e) {
            open = true
            t.target.matches(e.selector) && e.show(t)
        })
    }), document.addEventListener("click", function (t) {
        if (!open) {
            e.forEach(function (e) {
                t.target.matches('[data-contextmenu="' + e.id + '"], [data-contextmenu="' + e.id + '"] *') || e.hide()
            })
        }
        open = false
    }), i
});
//# sourceMappingURL=context-menu.js.map