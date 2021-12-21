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
migrationLaunchView.controller('DeliveryUnitViewController', ['$scope', '$http', '$messageHub', function ($scope, $http, $messageHub) {
    $scope.showCreateButton = false;
    $scope.showSeparator = false;
    $scope.isVisible = false;
    $scope.duDropdownDisabled = true;
    $scope.duDropdownInitText = "---Please select---";
    $scope.duDropdownText = $scope.duDropdownInitText;
    $scope.workspacesDropdownText = "---Please select---";
    $scope.workspaces = [];
    $scope.workspacesList = $scope.workspaces;
    $scope.deliveryUnits = [];
    $scope.deliveryUnitList = $scope.deliveryUnits;
    $scope.dataLoaded = false;
    $scope.selectAllText = 'Select all';
    $scope.duSelectedUItext = [];
    let selectedDeliveyUnit = [];
    let selectedWorkspace = undefined;
    let descriptionList = [
        "Please wait while we get all delivery unit(s)...",
        "Select the target workspace and delivery unit(s)"
    ];
    $scope.descriptionText = descriptionList[0];
    let connectionId = undefined;
    let neoData = undefined;
    let hanaData = undefined;
    let defaultErrorTitle = "Error loading delivery units";
    let defaultErrorDesc = "Please check if the information you provided is correct and try again.";
    let processId = undefined;

    $('.multi-selectable').on('click', function (e) {
        e.stopPropagation();
    });

    function getDUData() {
        body = {
            neo: {
                hostName: neoData.hostName,
                subaccount: neoData.subaccount,
            },
            hana: hanaData,
            processInstanceId: processId
        }

        $http.post(
            "/services/v4/js/ide-migration/server/migration/api/migration-rest-api.js/continue-process",
            JSON.stringify(body),
            { headers: { 'Content-Type': 'application/json' } }
        ).then(function (response) {
            const timer = setInterval(function () {
                $http.post(
                    "/services/v4/js/ide-migration/server/migration/api/migration-rest-api.js/get-process",
                    JSON.stringify(body),
                    { headers: { 'Content-Type': 'application/json' } }
                ).then(function (response) {
                    if (response.data && response.data.failed) {
                        clearInterval(timer);
                        $messageHub.announceAlertError(
                            defaultErrorTitle,
                            defaultErrorDesc
                        );
                        errorOccurred();
                    } else if (response.data.workspaces && response.data.deliveryUnits && response.data.connectionId) {
                        clearInterval(timer);
                        connectionId = response.data.connectionId;
                        $scope.workspaces = response.data.workspaces;
                        $scope.workspacesList = $scope.workspaces;
                        $scope.deliveryUnits = response.data.deliveryUnits;
                        $scope.deliveryUnitList = $scope.deliveryUnits;
                        $scope.$parent.setBottomNavEnabled(true);
                        $scope.descriptionText = descriptionList[1];
                        $scope.dataLoaded = true;
                    }
                }, function (response) { })
            }, 1000);

        }, function (response) {
            if (response.data) {
                if ("error" in response.data) {
                    if ("message" in response.data.error) {
                        $messageHub.announceAlertError(
                            defaultErrorTitle,
                            response.data.error.message
                        );
                    } else {
                        $messageHub.announceAlertError(
                            defaultErrorTitle,
                            defaultErrorDesc
                        );
                    }
                    console.error(`HTTP $response.status`, response.data.error);
                } else {
                    $messageHub.announceAlertError(
                        defaultErrorTitle,
                        defaultErrorDesc
                    );
                }
            } else {
                $messageHub.announceAlertError(
                    defaultErrorTitle,
                    defaultErrorDesc
                );
            }
            errorOccurred();
        });
    };

    function errorOccurred() {
        $scope.$parent.previousClicked();
        $scope.$parent.setBottomNavEnabled(true);
    }

    $scope.filterDU = function () {
        if ($scope.duSearch) {
            let filtered = [];
            for (let i = 0; i < $scope.deliveryUnits.length; i++) {
                if ($scope.deliveryUnits[i].name.toLowerCase().includes($scope.duSearch.toLowerCase())) {
                    filtered.push($scope.deliveryUnits[i]);
                }
            }
            $scope.deliveryUnitList = filtered;
        } else {
            $scope.deliveryUnitList = $scope.deliveryUnits;
        }
    };

    $scope.filterWorkspaces = function () {
        if ($scope.workspacesSearch) {
            $scope.showCreateButton = true;
            $scope.showSeparator = true;
            let filtered = [];
            for (let i = 0; i < $scope.workspaces.length; i++) {
                if ($scope.workspaces[i].toLowerCase().includes($scope.workspacesSearch.toLowerCase())) {
                    filtered.push($scope.workspaces[i]);
                } else {
                    $scope.showSeparator = false;
                }
            }
            $scope.workspacesList = filtered;


        } else {
            $scope.showSeparator = false;
            $scope.showCreateButton = false;
            $scope.workspacesList = $scope.workspaces;
        }
        $scope.btnBottonText = $scope.workspacesSearch;
    };

    $scope.workspaceSelected = function (workspace) {
        selectedWorkspace = workspace;
        $scope.workspacesDropdownText = workspace;
        $scope.duDropdownDisabled = false;
    };

    $scope.isDUSelected = (du) => {
        return selectedDeliveyUnit.includes(du) ? "selected" : '';

    };

    $scope.allDUSelectable = () => {
        return selectedDeliveyUnit.length < $scope.deliveryUnitList.length ? "selected" : "";
    }

    $scope.toggleSelectAllDU = () => {
        let compare_value = (selectedDeliveyUnit.length != $scope.deliveryUnitList.length);
        for (let i = 0; i < $scope.deliveryUnitList.length; i++)
            if (Boolean($scope.isDUSelected($scope.deliveryUnitList[i])) !== compare_value)
                $scope.duSelected($scope.deliveryUnitList[i]);
    };

    $scope.duSelected = function (deliveryUnit) {
        if (selectedDeliveyUnit.includes(deliveryUnit)) {
            selectedDeliveyUnit = selectedDeliveyUnit.filter((elem) => elem != deliveryUnit);
            $scope.duSelectedUItext = $scope.duSelectedUItext.filter((elem) => elem != deliveryUnit.name);
        } else {
            selectedDeliveyUnit.push(deliveryUnit);
            $scope.duSelectedUItext.push(deliveryUnit.name);
        }

        $scope.duDropdownText = $scope.duSelectedUItext.length ? $scope.duSelectedUItext.join(", ") : $scope.duDropdownInitText;

        $scope.selectAllText = selectedDeliveyUnit.length == $scope.deliveryUnitList.length ? "Unselect all" : "Select all";
        $scope.$parent.setFinishEnabled(true);

    };

    $messageHub.on('migration.delivery-unit', function (msg) {
        if ("isVisible" in msg.data) {
            $scope.$apply(function () {
                $scope.dataLoaded = false;
                $scope.duDropdownDisabled = true;
                $scope.duDropdownText = "---Please select---";
                $scope.workspacesDropdownText = "---Please select---";
                $scope.descriptionText = descriptionList[0];
                $scope.isVisible = msg.data.isVisible;
                if (msg.data.isVisible) {
                    if (selectedDeliveyUnit.length) {
                        $scope.$parent.setFinishEnabled(true);
                    } else {
                        $scope.$parent.setFinishEnabled(false);
                    }
                    $scope.$parent.setBottomNavEnabled(false);
                    $scope.$parent.setPreviousVisible(true);
                    $scope.$parent.setPreviousEnabled(true);
                    $scope.$parent.setNextVisible(false);
                    $scope.$parent.setFinishVisible(true);
                }
            });
            if (msg.data.isVisible) {
                $messageHub.message('migration.neo-credentials', { controller: "migration.delivery-unit", getData: "all" });
                $messageHub.message('migration.hana-credentials', { controller: "migration.delivery-unit", getData: "all" });
            }
        }
        if ("neoData" in msg.data) {
            neoData = msg.data.neoData;
        }
        if ("hanaData" in msg.data) {
            hanaData = msg.data.hanaData;
            processId = msg.data.hanaData.processId;
            getDUData();
        }
        if ("getData" in msg.data) {
            if (msg.data.getData === "all") {
                $messageHub.message(msg.data.controller, {
                    duData: {
                        "processId": processId,
                        "connectionId": connectionId,
                        "workspace": selectedWorkspace,
                        "du": selectedDeliveyUnit,
                    }
                });
            }
        }
    }.bind(this));
}]);