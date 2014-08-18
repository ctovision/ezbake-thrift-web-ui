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

/**
    An example thrift file used for unit testing of the thrift parser.
*/

/**
* Comment1
*/

/**Comment2*/

namespace java com.example.org
namespace ccp example.org
namespace perl Example.Org
namespace js example.org

typedef string Name
typedef set<string> Names

enum testNum {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3
}

enum aNum {
    YUP,
    TEST,
    WINNING
}

enum sNum {
    SINGLE
}

struct Members {
    1:optional Names apps
    2:optional Names users
}

struct Permissions {
    1:required bool dataAccess = false
    2:required bool adminRead = false
    3:required bool adminWrite = false
    4:required bool adminManage = false
    5:required bool adminCreateChild = false
}

exception Exceptional {
    1:required string message
    2:required OperationError operation
}

service Tester {
    string getName(),
    map<string, string> getOptions(1: string key)
}

service Singler {
    string test()
}

service Testing extends Tester {
    string getAnotherName();

    void createGroup(
        1:required EzSecurityToken token,
        2:required GroupName parent,
        3:required string name,
        4:required GroupInheritancePermissions parentGroupInheritance,
    ) throws (
        1:EzSecurityTokenException tokenError,
        2:AuthorizationException authorizationError,
        3:EzGroupOperationException createError
    );

    void createStuff(
        1:required EzSecurityToken token,
        2:bool whateverStuff=true
    );

    void createGroupWithInclusion(
        1:required EzSecurityToken token,
        2:required string parent,
        3:required string name,
        4:required GroupInheritancePermissions parentGroupInheritance,
        5:bool includeOnlyRequiresUser=false,
        6:bool includedIfAppInChain=true
    ) throws (
        1:ezbakeBaseTypes.EzSecurityTokenException tokenError,
        2:AuthorizationException authorizationError,
        3:EzGroupOperationException createError
    );

    void deactivateGroup(
        1:required EzSecurityToken token,
        2:required string groupName,
        3:bool andChildren=false
    ) throws (
        1:ezbakeBaseTypes.EzSecurityTokenException tokenError,
        2:AuthorizationException authorizationError,
        3:EzGroupOperationException createError
    );
}
