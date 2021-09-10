/*
 * Copyright (c) 2021 SAP SE or an SAP affiliate company and XSK contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Apache License, v2.0
 * which accompanies this distribution, and is available at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and XSK contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const exec = require("core/v4/exec");
const config = require("core/v4/configurations");

const neoClientPath = config.get("user.dir") + "/target/dirigible/resources-neo-sdk/tools/neo.sh";

class NeoDatabasesService {

  getAvailableDatabases(credentials) {
    const account = credentials.account;
    const host = credentials.host;
    const user = credentials.user;
    const password = credentials.password;
    const db = credentials.db;

    const script = `${neoClientPath} list-schemas -a "${account}" -h "${host}" -u "${user}" -p "${password}" --output json`
    
    const rawCommandResult = exec.exec(script, {
      "JAVA_HOME": config.get("JAVA8_HOME"),
      "PATH": config.get("JAVA8_HOME") + "/bin:" + config.get("PATH")
    });

    const commandResult = JSON.parse(rawCommandResult);

    if (commandResult.errorMsg) {
      throw "[NEO CLIENT ERROR]" + neoOutput.errorMsg
    }

    const rawDatabasesOutput = commandResult.commandOutput;
    const databases = this._parseDatabasesOutput(rawDatabasesOutput);

    return databases;
  }

  _parseDatabasesOutput(databasesOutput) {
    // const databasesOutput = "\nWarning: Your SDK version \"4.2.4\" is no longer supported. The latest version is \"4.9.4\" and upgrade is highly recommended.\n\n\nSchema ID\n  slbinno\n  slbinno2\n"
    const schemaIdText = "Schema ID";
    const schemaIndex = databasesOutput.indexOf(schemaIdText);
    
    let databasesRawList = databasesOutput.substring(schemaIndex + schemaIdText.length);
    databasesRawList = databasesRawList.replace(/[\r\n]+/g,"");
    databasesRawList = databasesRawList.replace(/[\s]+/g, ",");
    
    const databasesList = databasesRawList
        .split(",")
        .filter(x => x !== undefined && x !== null && x !== "")
        .map(x => x.trim());

    return databasesList;
  }
}

module.exports = NeoDatabasesService;