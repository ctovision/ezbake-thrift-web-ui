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

module.exports = (function () {
    return {
        server: {
            host: "localhost",
            port: "3000",
            ssl: {
                port: "8443",
                keyPath: undefined,
                certPath: undefined,
                pfxPath: undefined
            },
            cors: true,
            baseRelativePath: "/",
            viewEngine: "ejs",
            viewCaching: true,
            security: "mockSecurity",
            mockSecurityOpts: {
                username: "testUser1"
            },
            ezSecurityOpts: {
                UserInfoHeader: "EZB_VERIFIED_USER_INFO",
                SignatureHeader: "EZB_VERIFIED_SIGNATURE",
                HeaderPrefix: "HTTP_",
                publicKey: ((process.env.EZCONFIGURATION_DIR || "/etc/sysconfig/ezbake/pki/")),
                validate: true
            }
        },
        thrifts: [
            { fileName: "EzGroups.thrift", label: "EzGroups", appName: "common_services", serviceName: "ezgroups" },
            { fileName: "ezprofile.thrift", label: "EzProfile", appName: "common_services", serviceName: "ezprofile" }
        ],
        debug: {
            request: ["error"]
        }
    };
}());
