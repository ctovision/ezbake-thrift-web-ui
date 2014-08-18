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

module.exports = (function (server, configuration, security) {
    var path = require("path");
    var thrift = require("thrift");
    var thriftUtils = thrift.ThriftUtils;
    var ezConfig = require("ezConfiguration");

    server.methods.getParsedThrifts(null, function (err, result) {
        if (err === undefined || err === null) {
            var registeredServices = [];
            for (var i = 0; i < result.length; ++i) {
                for (var serviceName in result[i].service) {
                    if (result[i].service.hasOwnProperty(serviceName)) {
                        var service = result[i].service[serviceName];
                        for (var methodName in service) {
                            if (service.hasOwnProperty(methodName)) {
                                var method = service[methodName];
                                (function (s, m, meth) {
                                    var p = path.join(configuration.server.baseRelativePath, ("/thrift/" + s + "/" + m));
                                    registeredServices.push({
                                        path: p,
                                        method: "POST"
                                    });
                                    server.route({
                                        method: "GET",
                                        path: p,
                                        config: {
                                            handler: function (request, reply) {
                                                reply(JSON.stringify(meth, null, 4)).type('application/json');
                                            }
                                        }
                                    });
                                    server.route({
                                        method: "POST",
                                        path: p,
                                        config: {
                                            handler: function (request, reply) {
                                                security.getAuthToken(request, function (err, token) {
                                                    // Code to interface with thrift here!
                                                    if (configuration.security === "ezSecurity") {
                                                        var ezConfig = new EzConfiguration.EzConfiguration();
                                                        var utils = new thriftUtils(ezConfig);

                                                        var gened = require("../gen-nodejs/" + s);

                                                        var data = request.payload;

                                                        utils.getConnection(data.appName, data.serviceName, function (err2, connection, close) {
                                                            var thriftClient = thrift.createClient(gened, connection);
                                                            var params = [token].concat(data.params).concat(function () {
                                                                var results = arguments;
                                                                reply({
                                                                    results: results,
                                                                    service: s,
                                                                    error: err
                                                                }).type('application/json');
                                                            });
                                                            thriftClient[m].apply(this, params);
                                                        });
                                                    } else {
                                                        // We're mocking or something else; can't use thrift etc
                                                        reply({
                                                            token: token,
                                                            service: s,
                                                            error: err
                                                        }).type('application/json');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }(serviceName, methodName, method));
                            }
                        }
                    }
                }
            }
            server.route({
                method: "GET",
                path: path.join(configuration.server.baseRelativePath, "/thrift/"),
                config: {
                    handler: function (request, reply) {
                        reply(JSON.stringify(registeredServices, null, 4)).type('application/json');
                    }
                }
            });
        }
    });
});
