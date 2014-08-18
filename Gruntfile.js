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

module.exports = (function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell');

    var execute = function (command, args, path, callback, context){
	    var cmd = require("child_process").spawn(command, args, { cwd: path });
	    cmd.stdout.setEncoding("utf8");
	    cmd.stdout.on("data", function (data) {
	    	console.log(data);
	    });
	    cmd.stderr.setEncoding("utf8");
	    cmd.stderr.on("data", function (data) {
	    	console.log(data);
	    });
	    if (callback !== undefined) {
	    	cmd.on("exit", function (code) {
	    		callback.apply((context || this), [code]);
	    	});
	    }
	};

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            build: "./build/",
            thriftGen: "./gen-nodejs/",
            ezSecurityThrift: "./.tmp/",
            thriftFiles: "./thrifts/"
        },
        copy: {
            build: {
                src: "**",
                dest: "./build/target/"
            },
            deployer: {
                src: "./registration.yml",
                dest: "./build/release/EzSecurity-UserInterface-manifest.yml"
            }
        },
        shell: {
            pack: {
                options: {
                    execOptions: {
                        cwd: "./build/target/",
                        maxBuffer: NaN
                    }
                },
                command: "tar -zcvf /tmp/EzSecurity-UserInterface.tar.gz ./*; mv /tmp/EzSecurity-UserInterface.tar.gz ../release/EzSecurity-UserInterface.tar.gz;"
            },
            findAndCopyThrifts: {
                options: {
                    execOptions: {
                        cwd: "./"
                    }
                },
                command: 'find ./.tmp/ -iname "*.thrift" -type f -exec /bin/mv {} ./thrifts/ \\;'
            },
            getThriftSubmodules: {
                options: {
                    execOptions: {
                        cwd: "./.tmp/"
                    }
                },
                command: "git submodule init; git submodule update;"
            },
            npmPruneDevDependencies: {
                options: {
                    execOptions: {
                        cwd: "./build/target/"
                    }
                },
                command: "npm prune --production"
            }
        }
    });

    grunt.registerTask("generateConfiguredThrifts", function () {
        var done = this.async();

        var pkg = require("./package");
        var defaultConfig = require("./config/default");
        var environmentConfig = require("./config/environments/" + pkg.environment) || { };

        var finalConfig = require("msngr").extend(environmentConfig, defaultConfig);

        var tasks = [];
        for (var i = 0; i < finalConfig.thrifts.length; ++i) {
            (function (file) {
                tasks.push(function (callback) {
                    execute("thrift", ["-r", "--gen", "js:node", ("./thrifts/" + file)], "./", function () {
                        callback(null, null);
                    });
                });
            }(finalConfig.thrifts[i].fileName));
        }
        require("async").parallel(tasks, function () {
            done();
        });
    });

    grunt.registerTask("fetchThrifts", function () {
        var done = this.async();
        execute("git", ["clone", "git@github.com:ezbake/ezbake-security-thrift.git", ".tmp"], "./", function () {
            done();
        });
    });

    grunt.registerTask("mkdir:release", function () {
        grunt.file.mkdir("./build/release/");
    });

    grunt.registerTask("mkdir:thrifts", function () {
        grunt.file.mkdir("./thrifts/");
    });

    grunt.registerTask("generateThrift", ["clean:thriftGen", "clean:thriftFiles", "clean:ezSecurityThrift", "fetchThrifts", "shell:getThriftSubmodules", "mkdir:thrifts", "shell:findAndCopyThrifts", "clean:ezSecurityThrift", "generateConfiguredThrifts"]);

    grunt.registerTask("init", ["generateThrift"]);

    grunt.registerTask("openshit-ify", function () {
        var pkg = "./build/target/package.json";
        var p = require(pkg);
        delete p.dependencies;
        delete p.devDependencies;
        delete p.optionalDependencies;
        require("fs").writeFileSync(pkg, JSON.stringify(p), { encoding: "utf8" });
    });

    grunt.registerTask("targetEnv:openshift", function () {
        var pkg = "./build/target/package.json";
        var p = require(pkg);
        p.environment = "openshift";
        require("fs").writeFileSync(pkg, JSON.stringify(p), { encoding: "utf8" });
    });

    grunt.registerTask("targetEnv:development", function () {
        var pkg = "./build/target/package.json";
        var p = require(pkg);
        p.environment = "development";
        require("fs").writeFileSync(pkg, JSON.stringify(p), { encoding: "utf8" });
    });

    grunt.registerTask("build:openshift", ["clean:build", "init", "copy:build", "shell:npmPruneDevDependencies", "openshit-ify", "targetEnv:openshift", "mkdir:release", "copy:deployer", "shell:pack"]);
});
