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
const MigrationService = require('ide-migration/server/migration/controllers/migration-service');
const process = require('bpm/v4/process');
const execution = process.getExecutionContext();

process.setVariable(execution.getId(), 'migrationState', 'DELIVERY_UNITS_LISTING');

const userDataJson = process.getVariable(execution.getId(), 'userData');
const userData = JSON.parse(userDataJson);
const userDatabaseData = userData.hana;

const migrationService = new MigrationService();
migrationService.setupConnection(userDatabaseData.databaseSchema, userDatabaseData.username, userDatabaseData.password);
const deliveryUnits = migrationService.getAllDeliveryUnits()
process.setVariable(execution.getId(), 'deliveryUnits', JSON.stringify(deliveryUnits));
process.setVariable(execution.getId(), 'migrationState', 'DELIVERY_UNITS_LISTED');

process.setVariable(execution.getId(), 'migrationState', 'WORKSPACES_LISTING');
const workspaceManager = require("platform/v4/workspace");
const workspaces = workspaceManager.getWorkspacesNames();
process.setVariable(execution.getId(), 'workspaces', JSON.stringify(workspaces));

process.setVariable(execution.getId(), 'migrationState', 'WORKSPACES_LISTED');