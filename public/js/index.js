/*   Copyright (C) 2013-2014 Computer Sciences Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. */

(function () {
    var isObject = function (input) {
        return ((input !== undefined && input !== null) && Object.prototype.toString.call(input) === "[object Object]");
    };

    var isArray = function (input) {
        return ((input !== undefined && input !== null) && Object.prototype.toString.call(input) === "[object Array]");
    };

    var ajax = function (options) {
		if (options === undefined || options.method === undefined || options.url === undefined) {
			return;
		}
        var numTries = 0,
            maxTries = (typeof options.retries == 'number') ? options.retries : 3;
		try {
			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function () {
                var url;
				if (xhr.readyState === 4) {
					if (xhr.status === 200 || xhr.status === 201) {
						if (options.success !== undefined) {
							options.success.apply((options.context || this), [xhr.status, xhr.response]);
						}
					} else if (xhr.status === 401) {
						if (options.error !== undefined || options.failure !== undefined) {
                           (options.error || options.failure).apply((options.context || this), [xhr.status, xhr.response]);
                       }
					} else if (xhr.status === 403) {
						if (options.error !== undefined || options.failure !== undefined) {
						   (options.error || options.failure).apply((options.context || this), [xhr.status, xhr.response]);
						}
                    } else {
                        if (xhr.status == 0 && (options.method == 'GET' || options.method == 'OPTIONS') && numTries++ < maxTries) {
                            url = createUrl();
			                xhr.open(options.method, url);
                            if (isObject(options.data) || isArray(options.data)) {
				                xhr.setRequestHeader("Content-Type", "application/json");
				                xhr.send(JSON.stringify(options.data));
			                } else {
				                xhr.send(options.data);
			                }
                        } else {
						    if (options.error !== undefined || options.failure !== undefined) {
							    (options.error || options.failure).apply((options.context || this), [xhr.status, xhr.response]);
						    }
                        }
					}
				}
			};

			if (options.progress !== undefined) {
				xhr.addEventListener("progress", options.progress);
			}

			xhr.withCredentials = (options.withCredentials !== undefined) ? options.withCredentials : true;

			var query = [];
			if (options.query !== undefined) {
				for (var key in options.query) {
					if (options.query.hasOwnProperty(key)) {
						var opt = options.query[key];
						if (!Ozone.utils.isArray(opt)) {
							opt = [opt];
						}
						for (var i = 0; i < opt.length; ++i) {
							query.push(key + "=" + options.query[key]);
						}
					}
				}
			}

            var queryString = ((query.length > 0) ? "&" + query.join("&") : "");
            function createUrl () {
                var url = options.url;
                if (options.allowCaching !== true) {
                    url = url + "?=_" + (new Date().getTime());
                }
                url = url + queryString;
                return url;
            }
			xhr.open(options.method, createUrl());
			xhr.timeout = (options.timeout !== undefined) ? options.timeout : 2000;
			xhr.responseType = (options.type !== undefined) ? options.type : "json";

			if (isObject(options.data) || isArray(options.data)) {
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.send(JSON.stringify(options.data));
			} else {
				xhr.send(options.data);
			}
		} catch (ex) {
			if (options.error !== undefined || options.failure !== undefined) {
				(options.error || options.failure).apply((options.context || this), [ex]);
			}
		}
	};

    // On load within index
    document.addEventListener("polymer-ready", function () {
        var tabs = document.querySelector("paper-tabs");
        var pages = document.querySelector("core-pages");
        var aboutDialog = document.querySelector("paper-dialog[id=about]");
        var credentialsDialog = document.querySelector("paper-dialog[id=creds]");
        var outputDialog = document.querySelector("paper-dialog[id=output]");

        var resetOutput = function () {
            if (outputDialog !== undefined && outputDialog !== null) {
                while (outputDialog.firstChild) {
                    outputDialog.removeChild(outputDialog.firstChild);
                }
            }
        };

        var logToOutput = function (input, color) {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode(input));
            if (color !== undefined) {
                p.style.color = color;
            }
            outputDialog.appendChild(p);
        };

        var ensureOutputOpen = function () {
            if (outputDialog.opened === false) {
                outputDialog.toggle();
            }
        };

        if (tabs !== undefined && tabs !== null) {
            tabs.addEventListener("core-select", function () {
                var selectedTab = tabs.querySelector("paper-tab[name=" + tabs.selected + "]");
                pages.selected = selectedTab.getAttribute("pageIndex");
            });

            document.querySelector("paper-menu-button paper-item[name=mycreds]").addEventListener("click", function (e) {
                credentialsDialog.toggle();
            });

            document.querySelector("paper-menu-button paper-item[name=about]").addEventListener("click", function (e) {
                aboutDialog.toggle();
            });

            document.querySelector("paper-menu-button paper-item[name=output]").addEventListener("click", function (e) {
                outputDialog.toggle();
            });

            document.addEventListener("keypress", function (e) {
                var key = e.key;
                if (key === undefined) {
                    var keyChar = e.which || e.keyCode || e.charCode;
                    key = String.fromCharCode(keyChar);
                }
                if (key === "~") {
                    outputDialog.toggle();
                }
            });

            var ipages = document.querySelector("core-pages").childNodes;
            for (var i = 0; i < ipages.length; ++i) {
                if (ipages[i].nodeName.toLowerCase() === "div") {
                    (function (page) {
                        page.querySelector("paper-button[name=viewThrift]").addEventListener("click", function (e) {
                            page.querySelector("paper-dialog[name=thrift]").toggle();
                        });
                        page.querySelector("paper-button[name=viewJson]").addEventListener("click", function (e) {
                            page.querySelector("paper-dialog[name=json]").toggle();
                        });
                    }(ipages[i]));
                }
            }

            var methods = document.querySelectorAll("div[class=serviceMethod]");
            for (var i = 0; i < methods.length; ++i) {
                var method = methods[i];

                (function (m) {
                    var button = m.querySelector("paper-button[name=post]");
                    button.addEventListener("click", function (e) {
                        var obj = { };
                        obj.appName = m.getAttribute("data-app-name");
                        obj.serviceName = m.getAttribute("data-service-name");
                        obj.params = [];

                        var inputs = m.querySelectorAll("paper-input");
                        var checks = m.querySelectorAll("paper-checkbox");
                        var valueIndex = { };
                        for (var j = 0; j < inputs.length; ++j) {
                            valueIndex[inputs[j].getAttribute("name")] = inputs[j].value;
                        }
                        for (var j = 0; j < checks.length; ++j) {
                            valueIndex[checks[j].getAttribute("name")] = checks[j].checked;
                        }

                        var paramDefinition = m.querySelector("textarea").value;
                        if (paramDefinition !== undefined && paramDefinition !== null && paramDefinition.trim() !== "") {
                            paramDefinition = JSON.parse(paramDefinition);
                            for (var k = 0; k < paramDefinition.length; ++k) {
                                var d = paramDefinition[k];
                                if (d !== undefined) {
                                    if (valueIndex[d.name] !== undefined) {
                                        obj.params.push(valueIndex[d.name]);
                                    }
                                }
                            }
                        }

                        var split = m.getAttribute("id").split(".");
                        var uri = baseUrl + "thrift/" + split[0] + "/" + split[1];
                        resetOutput();
                        ensureOutputOpen();
                        logToOutput("Service: " + split[0]);
                        logToOutput("Method: " + split[1]);
                        logToOutput("URL: " + uri);
                        logToOutput("Data: " + JSON.stringify(obj, null, 4));
                        logToOutput("Sending to server...");
                        ajax({
                            url: uri,
                            method: "POST",
                            data: obj,
                            success: function (status, response) {
                                logToOutput("Sending to server completed successfully!", "green");
                                logToOutput("Response: " + JSON.stringify(response, null, 4));
                            },
                            error: function (status, response) {
                                logToOutput("Sending to server FAILED!", "maroon");
                                logToOutput("Response: " + JSON.stringify(response, null, 4));
                            }
                        });

                    });
                }(method));
            }
        }
    });
}());
