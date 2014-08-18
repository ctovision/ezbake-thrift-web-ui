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

module.exports = (function (server, configuration) {

    var formatters = {
        getLang: function (abb) {
            var langs = {
                "java": "Java",
                "cpp": "C++",
                "py": "Python",
                "js": "JavaScript",
                "cs": "C#",
                "thrift": "Thrift"
            };
            if (langs[abb] !== undefined) {
                return langs[abb];
            }
            return abb;
        }
    };

    var path = require("path");
    // Serve the start page of the web application
    server.route({
        method: "GET",
        path: path.join(configuration.server.baseRelativePath, "/"),
        config: {
            handler: function (request, reply) {
                server.methods.getParsedThrifts(null, function (err, result) {
                    reply.view("index", {
                        username: request.auth.credentials.username,
                        dn: request.auth.credentials.dn,
                        basePath: path.join(configuration.server.baseRelativePath, "/"),
                        thrifts: result,
                        formatters: formatters
                    });
                });
            }
        }
    })
});
