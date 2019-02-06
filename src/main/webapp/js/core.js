/*
* core.js
* @version : 1.0
* @Last Modified : 2019-02-06
* */
function DataUtil() {
}

DataUtil.base64Key = function () {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
};
DataUtil.encode = function (string) {
    let i = 0, result = "", characters = DataUtil.base64Key();
    do {
        let a = string.charCodeAt(i++), b = string.charCodeAt(i++), c = string.charCodeAt(i++);
        a = a ? a : 0;
        b = b ? b : 0;
        c = c ? c : 0;
        let b1 = (a >> 2) & 0x3F, b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
        let b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3), b4 = c & 0x3F;
        if (!b) {
            b3 = b4 = 64;
        } else if (!c) {
            b4 = 64;
        }
        result += DataUtil.base64Key().charAt(b1) + DataUtil.base64Key().charAt(b2) + DataUtil.base64Key().charAt(b3)
            + DataUtil.base64Key().charAt(b4);
    } while (i < string.length);
    return result;
};
DataUtil.decode = function (string) {
    let i = 0, result = '', characters = DataUtil.base64Key();
    do {
        let b1 = DataUtil.base64Key().indexOf(string.charAt(i++));
        let b2 = DataUtil.base64Key().indexOf(string.charAt(i++));
        let b3 = DataUtil.base64Key().indexOf(string.charAt(i++));
        let b4 = DataUtil.base64Key().indexOf(string.charAt(i++));
        let a = ((b1 & 0x3F) << 2) | ((b2 >> 4) & 0x3), b = ((b2 & 0xF) << 4) | ((b3 >> 2) & 0xF);
        let c = ((b3 & 0x3) << 6) | (b4 & 0x3F);
        result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');
    } while (i < string.length);
    return result;
};
DataUtil.now = function () {
    let dte = new Date(),
        month = '' + (dte.getMonth() + 1),
        day = '' + dte.getDate(),
        year = dte.getFullYear();
    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }
    return [year, month, day].join('-');
};

function SessionDB() {
}

SessionDB.set = function (name, value) {
    if (sessionStorage) {
        if (typeof value !== "undefined") {
            if (typeof value === "object") {
                sessionStorage.setItem(name, JSON.stringify(value));
            } else {
                sessionStorage.setItem(name, value);
            }
        }
    }
};
SessionDB.get = function (name) {
    if (sessionStorage) {
        try {
            return JSON.parse(sessionStorage.getItem(name));
        } catch (ex) {
        }
        return sessionStorage.getItem(name);
    }
    return false;
};
SessionDB.remove = function (name) {
    if (sessionStorage) {
        sessionStorage.removeItem(name);
    }
};
SessionDB.getLocale = function (name) {
    let txt, data = SessionDB.getValue("locale");
    if (typeof data === "object") {
        txt = data[name];
    }
    return (typeof txt === "string" && 0 < txt.trim().length) ? txt : name;
};
SessionDB.setValue = function (name, data) {
    if (typeof window.dcaptureMemory === "undefined") {
        window.dcaptureMemory = new Map();
    }
    window.dcaptureMemory.set(name, data);
};
SessionDB.getValue = function (name) {
    if (typeof window.dcaptureMemory === "undefined") {
        window.dcaptureMemory = new Map();
    }
    return window.dcaptureMemory.get(name);
};
SessionDB.removeValue = function (name) {
    if (window.dcaptureMemory instanceof Map) {
        window.dcaptureMemory.delete(name);
    }
};
SessionDB.setDataLocale = function () {
    let idx, tagName, name, txt, node, nodeArray = $("[data-locale]"), placeholderAry = $("[placeholder]");
    for (idx = 0; idx < nodeArray.length; idx++) {
        node = nodeArray[idx];
        name = node.getAttribute("data-locale");
        if (typeof name === "string") {
            tagName = node.tagName.toUpperCase();
            if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
                $(node).val(SessionDB.getLocale(name));
            } else {
                $(node).text(SessionDB.getLocale(name));
            }
        }
    }
    for (idx = 0; idx < placeholderAry.length; idx++) {
        node = placeholderAry[idx];
        name = node.getAttribute("placeholder");
        if (typeof name === "string") {
            $(node).prop("placeholder", SessionDB.getLocale(name));
        }
    }
};
SessionDB.loadLocale = function (url, callback) {
    let data, text = SessionDB.get("locale");
    if (typeof text === "string") {
        data = JSON.parse(text);
    }
    if (typeof data === "object") {
        SessionDB.setValue("locale", data);
        if (typeof callback === "function") {
            callback(data);
        }
    } else {
        $.ajax({
            type: "POST",
            contentType : "application/json",
            dataType: "json",
            url: url,
            error: function (err) {
                alert(err.responseText);
            },
            success: function (data) {
                SessionDB.set("locale", JSON.stringify(data));
                SessionDB.setValue("locale", data);
                if (typeof callback === "function") {
                    callback(data);
                }
            }
        });
    }
};
SessionDB.setLocale = function (name, value) {
    if (typeof SessionDB.getValue("locale") !== "object") {
        SessionDB.setValue("locale", {});
    }
    SessionDB.getValue("locale")[name] = value;
};
SessionDB.loadHtml = function (url, callback) {
    if (typeof SessionDB.getValue("html") === "undefined") {
        SessionDB.setValue("html", new Map());
    }
    let template = SessionDB.getValue("html").get(url);
    if (typeof template === "string") {
        if (typeof callback === "function") {
            callback(template);
        }
    } else {
        $.ajax({
            type: "GET",
            contentType : "html/text",
            url: url,
            dataType: 'html',
            cache: false,
            error: function (err) {
                alert(err.responseText);
            },
            success: function (html) {
                SessionDB.getValue("html").set(url, html);
                if (typeof callback === "function") {
                    callback(html);
                }
            }
        });
    }
};
SessionDB.setParameter = function (parameter) {
    if (history.pushState) {
        let url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + parameter;
        window.history.pushState({path: url}, '', url);
    }
};
SessionDB.clear = function () {
    if (typeof window.dcaptureMemory !== "undefined") {
        window.dcaptureMemory = new Map();
    }
    if (sessionStorage) {
        sessionStorage.clear();
    }
};

function CallFuture(delay) {
    if (typeof delay !== "number") {
        delay = 1000;
    }
    this.delay = delay;
    if (typeof window.callFutureIdsSet === "undefined") {
        window.callFutureIdsSet = new Set();
    }
}

CallFuture.prototype.call = function (listener) {
    this.cancelAll();
    const delayId = setInterval(function () {
        clearInterval(delayId);
        if (typeof listener === "function") {
            listener();
        }
    }, this.delay);
    window.callFutureIdsSet.add(delayId);
    return delayId;
};
CallFuture.prototype.cancel = function (intervalId) {
    if (typeof intervalId !== "undefined" && Number.isInteger(intervalId)) {
        clearInterval(intervalId);
        if (window.callFutureIdsSet.has(intervalId)) {
            window.callFutureIdsSet.delete(intervalId);
        }
    }
};
CallFuture.prototype.cancelAll = function () {
    window.callFutureIdsSet.forEach(function (delayId) {
        clearInterval(delayId);
    });
    window.callFutureIdsSet = new Set();
};

function Paging(name, limit) {
    let self = this;
    self.name = "";
    self.limit = 10;
    self.offset = 0;
    self.length = 0;
    self.totalRecords = 0;
    self.isPrevious = false;
    self.isNext = false;
    self.sortOrder = "";
    self.listener = false;
    if (typeof limit === "string") {
        self.name = name;
    }
    if (typeof limit === "number") {
        if (0 === limit) {
            limit = 10;
        } else if (500 < limit) {
            limit = 500;
        }
        self.limit = limit;
    }
    self.build = function (previousNode, nextNode, infoNode) {
        self.previous = previousNode;
        self.next = nextNode;
        self.info = infoNode;
    };
    self.set = function (obj) {
        if (typeof obj !== "object") {
            obj = {};
        }
        if (typeof obj.offset !== "number") {
            obj.offset = 0;
        }
        if (typeof obj.size !== "number") {
            obj.size = 0;
        }
        if (typeof obj.totalRecords !== "number") {
            obj.totalRecords = 0;
        }
        self.offset = obj.offset;
        self.totalRecords = obj.totalRecords;
        self.size = obj.size;
        let offsetIdx = obj.offset + 1, endIdx = obj.offset + obj.size, currentCount;
        self.isPrevious = true;
        self.isNext = true;
        if (0 === obj.size && 0 === obj.totalRecords) {
            if (typeof self.info !== "boolean") {
                self.info.text(" - ");
            }
        } else {
            if (typeof self.info !== "boolean") {
                if (0 === obj.size) {
                    if (0 === obj.totalRecords) {
                        self.info.text(" - ");
                    } else {
                        self.info.text("0 of " + obj.totalRecords);
                    }
                } else {
                    self.info.text(offsetIdx + " - " + endIdx + " of " + obj.totalRecords);
                }
            }
        }
        if (0 === obj.offset) {
            self.isPrevious = false;
        }
        currentCount = obj.offset + obj.size;
        if (obj.totalRecords <= currentCount) {
            self.isNext = false;
        }
        if (typeof self.previous === "object") {
            if (self.isPrevious) {
                self.previous.parent().removeClass("disabled");
            } else {
                self.previous.parent().addClass("disabled");
            }
        }
        if (typeof self.next === "object") {
            if (self.isNext) {
                self.next.parent().removeClass("disabled");
            } else {
                self.next.parent().addClass("disabled");
            }
        }
        return {name: self.name, offset: self.offset, limit: self.limit, searchText : ""};
    };
    self.get = function (reset) {
        if(reset === true) {
            self.set({});
        }
        return {name: self.name, offset: self.offset, limit: self.limit, searchText : ""};
    };
    self.getNext = function () {
        let obj = {};
        obj.name = self.name;
        obj.offset = self.offset + self.limit;
        obj.limit = self.limit;
        return obj;
    };
    self.getPrevious = function () {
        let obj = {};
        obj.name = self.name;
        obj.offset = self.offset - self.limit;
        obj.offset = 0 > obj.offset ? 0 : obj.offset;
        obj.limit = self.limit;
        return obj;
    };
    self.onNext = function (callback) {
        if (typeof self.next === "object") {
            self.next.on("click", function (evt) {
                evt.preventDefault();
                if (self.isNext && (typeof callback === "function")) {
                    callback(self.getNext());
                }
            });
        }
    };
    self.onPrevious = function (callback) {
        if (typeof self.previous === "object") {
            self.previous.on("click", function (evt) {
                evt.preventDefault();
                if (self.isPrevious && (typeof callback === "function")) {
                    callback(self.getPrevious());
                }
            });
        }
    };
}