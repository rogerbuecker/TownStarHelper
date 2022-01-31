// ==UserScript==
// @name         TownCentral [DEV]
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  TownCentral DEV
// @author       Roger - Modify from exisiting scripts from  Groove
// @match        https://townstar.sandbox-games.com/*
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gala.games&size=16
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  let configOpen = false;

  setup();

  function mainLoop() {
    console.log("loop");

    if (localStorage.getItem("collectTownCoin")) {
      collectTownCoinIfNeedet();
    }

    if (localStorage.getItem("toggleWaterFacility")) {
      toggleBuildingByType(
        "Water_Facility",
        localStorage.getItem("toggleWaterFacility"),
        "Water_Drum"
      );
    }

    if (localStorage.getItem("toggleLumberMill")) {
      //ToDo: Add woo check
      toggleBuildingByType(
        "Lumber_Mill",
        localStorage.getItem("toggleLumberMill"),
        "Lumber"
      );
    }

    if (localStorage.getItem("togglePowerPlant")) {
      toggleBuildingByType(
        "Power_Plant",
        localStorage.getItem("togglePowerPlant"),
        "Energy"
      );
    }

    if (localStorage.getItem("toggleSandMine")) {
      toggleBuildingByType(
        "Sand_Mine",
        localStorage.getItem("toggleSandMine"),
        "Silica"
      );
    }

    setTimeout(() => {
      if (typeof Game != "undefined" && Game.town != null) {
        //throttle requestAnimationFrame to 1fps
        window.requestAnimationFrame(mainLoop);
      }
    }, 1000);
  }

  function setup() {
    waitForElmVisible("#playnow-container").then((elm) => {
      console.log("PlayNow");
      document.querySelector("#playButton").click();
      setTimeout(() => {
        elm.click();
      }, 1000);
    });

    waitForElmVisible(
      "body > div:nth-child(27) > div > div > div > div > div.header-row > button"
    )
      .then((elm) => {
        console.log("close Popup");
        elm.click();
      })
      .finally(() => {
        LoadProductionMonitor();
        attachConfigGui();

        window.requestAnimationFrame(mainLoop);
      });
  }

  function waitForElmVisible(selector) {
    return new Promise((resolve) => {
      if (
        document.querySelector(selector) &&
        document.querySelector(selector).style.visibility !== "hidden"
      ) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (
          document.querySelector(selector) &&
          document.querySelector(selector).style.visibility !== "hidden"
        ) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    });
  }

  function closeAllScreens() {
    for (const element of document.getElementsByClassName("close-button")) {
      element.click();
    }
  }

  function toggleConfigVisible() {
    let configDiv = document.getElementById("configDiv");

    if (configOpen) {
      configDiv.style.display = "none";
      configDiv.style.visibility = "hidden";
      configOpen = false;
    } else {
      configDiv.style.visibility = "visible";
      configDiv.style.display = "block";
      closeAllScreens();
      configOpen = true;
    }
  }

  async function collectTownCoinIfNeedet() {
    if (
      typeof Game != "undefined" &&
      Game.challenge &&
      !Game.challenge.claimed
    ) {
      console.log("collect Town Coin");
      let collectEarningsResponse = await Game.collectEarnings();
      console.log(collectEarningsResponse.message);
    }
  }

  function LoadProductionMonitor() {
    console.log("LoadProductionMonitor");
    let trackedItems = [];

    class TrackUnitDeliverOutputTask extends UnitDeliverOutputTask {
      onArrive() {
        super.onArrive();

        let trackedItem = trackedItems.find(
          (item) => item.name.toUpperCase() == this.craft.toUpperCase()
        );

        if (trackedItem) {
          trackedItem.count++;
          if (trackedItem.count == 1) {
            trackedItem.first = Date.now();
          } else {
            let timeDiff = Date.now() - trackedItem.first;
            trackedItem.oneMin = trackedItem.count / (timeDiff / 60000);
            trackedItem.oneHour = trackedItem.count / (timeDiff / 3600000);
          }

          console.log(
            trackedItem.name +
              ":" +
              trackedItem.count +
              "|" +
              trackedItem.oneMin.toFixed(2) +
              "/min |" +
              trackedItem.oneHour.toFixed(2) +
              "/h"
          );
        } else {
          trackedItems.push({
            name: this.craft.toUpperCase(),
            count: 0,
            first: 0,
            oneMin: 0,
            oneHour: 0,
          });
        }

        localStorage.setItem("trackedItems", JSON.stringify(trackedItems));
      }
    }

    let origfindDeliverOutputTask =
      TS_UnitLogic.prototype.findDeliverOutputTask;
    TS_UnitLogic.prototype.findDeliverOutputTask = function (t) {
      let origReturn = origfindDeliverOutputTask.call(this, t);
      return origReturn
        ? new TrackUnitDeliverOutputTask(
            origReturn.unit,
            origReturn.targetObject,
            t
          )
        : null;
    };
  }

  function attachConfigGui() {
    console.log("attachConfigGui");

    const helperButtonDiv = document.createElement("DIV");
    const buttonImage = document.createElement("IMG");
    const bothItemsList = document.createElement("DIV");
    const bothBuildingsList = document.createElement("DIV");
    const allBuildingsList = document.createElement("DIV");
    const activeBuildingsList = document.createElement("DIV");
    const allItemsList = document.createElement("DIV");
    const activeItemsList = document.createElement("DIV");
    const configDiv = document.createElement("DIV");

    helperButtonDiv.style = "position: fixed; bottom: 5px; right: 15px;";
    buttonImage.src =
      "https://user-images.githubusercontent.com/2233130/151796996-ae008a4b-ad0b-4109-96f1-f94983da2ea2.png";
    buttonImage.onclick = toggleConfigVisible;
    buttonImage.width = 100;
    buttonImage.height = 100;

    helperButtonDiv.appendChild(buttonImage);

    bothItemsList.setAttribute("style", "height:45%;");
    bothBuildingsList.setAttribute("style", "height:45%;");

    allItemsList.setAttribute(
      "style",
      "width: 45%;float: left;height: 100%;position: relative;overflow-y: auto;border: 5px dotted green;margin-right: 4%;padding: 1%;"
    );
    allItemsList.id = "allItemsList";

    if (localStorage.getItem("allItemsList")) {
      allItemsList.innerHTML = localStorage.getItem("allItemsList");
    } else {
      for (var key in Game.craftData) {
        const item = Game.craftData[key];
        const option = document.createElement("DIV");
        const itemInfo =
          key + " " + item.CityPoints + "pt " + item.CityPrice + "$";
        option.innerText = key;
        option.title = itemInfo;
        option.setAttribute("data-key", key);
        allItemsList.appendChild(option);
      }
    }

    activeItemsList.setAttribute(
      "style",
      "width: 45%;float: left;height: 100%;position: relative;overflow-y: auto;border: 5px dotted green;padding: 1%;"
    );
    activeItemsList.id = "activeItemsList";

    if (localStorage.getItem("activeItemsList")) {
      activeItemsList.innerHTML = localStorage.getItem("activeItemsList");
    }

    var x = document.createElement("STRONG");
    var t = document.createTextNode("Autosell:");
    x.appendChild(t);

    bothItemsList.append(x);
    bothItemsList.append(allItemsList);
    bothItemsList.append(activeItemsList);

    allBuildingsList.setAttribute(
      "style",
      "width: 45%;float: left;height: 100%;position: relative;overflow-y: auto;border: 5px dotted green;margin-right: 4%;padding: 1%;"
    );
    allBuildingsList.id = "allBuildingsList";

    if (localStorage.getItem("allBuildingsList")) {
      allBuildingsList.innerHTML = localStorage.getItem("allBuildingsList");
    } else {
      /* for (var key in Game.craftData) {
        const item = Game.craftData[key];
        const option = document.createElement("DIV");
        const itemInfo =
          key + " " + item.CityPoints + "pt " + item.CityPrice + "$";
        option.innerText = key;
        option.title = itemInfo;
        option.setAttribute("data-key", key);
        allItemsList.appendChild(option);
      } */
    }

    activeBuildingsList.setAttribute(
      "style",
      "width: 45%;float: left;height: 100%;position: relative;overflow-y: auto;border: 5px dotted green;padding: 1%;"
    );
    activeBuildingsList.id = "activeBuildingsList";

    if (localStorage.getItem("activeBuildingsList")) {
      activeBuildingsList.innerHTML = localStorage.getItem("activeBuildingsList");
    }

    var x = document.createElement("STRONG");
    var t = document.createTextNode("Toggle Building:");
    x.appendChild(t);

    bothBuildingsList.append(x);
    bothBuildingsList.append(allBuildingsList);
    bothBuildingsList.append(activeBuildingsList);

    configDiv.id = "configDiv";
    configDiv.setAttribute(
      "style",
      "position: fixed;z-index: 1000; left: 25%; top: 10%; width: 50%; height: 70%; background-color: rgb(163, 207, 65); opacity: 0.65; visibility:hidden; padding: 10px; color: green;"
    );

    configDiv.append(bothItemsList);
    configDiv.append(bothBuildingsList);

    var sortAll = Sortable.create(allItemsList, {
      group: {
        name: "shared",
      },
      onSort: (evt) => {
        localStorage.setItem("allItemsList", allItemsList.innerHTML);
      },
      animation: 150,
      sort: false, // To disable sorting: set sort to false
    });

    var sortActive = Sortable.create(activeItemsList, {
      group: "shared",
      onSort: (evt) => {
        localStorage.setItem("activeItemsList", activeItemsList.innerHTML);
      },
      onAdd: (evt) => {
        evt.item.onclick = function (clickEvent) {
          if (
            !clickEvent.shiftKey &&
            parseInt(evt.item.getAttribute("data-amount")) >= 10
          ) {
            evt.item.setAttribute(
              "data-amount",
              parseInt(evt.item.getAttribute("data-amount")) + 1
            );
          } else if (
            clickEvent.shiftKey &&
            parseInt(evt.item.getAttribute("data-amount")) >= 11
          ) {
            evt.item.setAttribute(
              "data-amount",
              parseInt(evt.item.getAttribute("data-amount")) - 1
            );
          }

          evt.item.textContent =
            evt.item.getAttribute("data-key") +
            " Amount:" +
            evt.item.getAttribute("data-amount");
        };
        evt.item.setAttribute("data-amount", 20);
        evt.item.textContent =
          evt.item.getAttribute("data-key") +
          " Amount:" +
          evt.item.getAttribute("data-amount");
      },
      animation: 150,
    });

    document.getElementsByTagName("Body")[0].appendChild(configDiv);
    document.getElementsByTagName("Body")[0].appendChild(helperButtonDiv);

    //add event listener key s
    document
      .getElementById("application-canvas")
      .addEventListener("keydown", function (event) {
        if (event.key === "s") {
          toggleConfigVisible();
        }
      });
  }

  function toggleBuildingByType(type, stopValue, craft, additionalCheck = true) {
    const buildingArray = Object.values(Game.town.objectDict).filter(
      (o) => o.type === type
    );

    if (buildingArray.length > 0) {
      if (Game.town.GetStoredCrafts()[craft] >= stopValue && additionalCheck) {
        for (i = 0; i < buildingArray.length; i++) {
          if (
            buildingArray[i].logicObject.data.craft == craft &&
            buildingArray[i].logicObject.data.state != "Produce"
          ) {
            buildingArray[i].logicObject.SetCraft("None");
          }
        }
        console.log("Turning off " + type);
      } else {
        for (i = 0; i < buildingArray.length; i++) {
          if (buildingArray[i].logicObject.data.craft == "None") {
            sandMineArray[i].logicObject.SetCraft(craft);
          }
        }
        console.log("Turning on " + type);
      }
    }
  }

  function isWoodNeeded() {
    const ConstructionSiteArray = Object.values(Game.town.objectDict).filter(
      (o) => o.type === "Construction_Site"
    );
    let isConstructionNeedWood = false;

    if (ConstructionSiteArray.length > 0) {
      let woodInNeed = 0;
      for (i = 0; i < ConstructionSiteArray.length; i++) {
        if (ConstructionSiteArray[i].logicObject.data.state == "Complete") {
          if (
            Game.objectData[ConstructionSiteArray[i].logicObject.data.type]
              .LaborCost <= LaborCost.value
          ) {
            ConstructionSiteArray[i].logicObject.OnTapped();
          }
        } else {
          if (
            ConstructionSiteArray[i].logicObject.constructionData.reqs.Wood !=
            undefined
          ) {
            if (
              ConstructionSiteArray[i].logicObject.data.receivedCrafts.Wood ==
                undefined ||
              ConstructionSiteArray[i].logicObject.data.receivedCrafts.Wood <
                ConstructionSiteArray[i].logicObject.constructionData.reqs.Wood
            ) {
              var parsedWoodRequired = parseInt(
                ConstructionSiteArray[i].logicObject.constructionData.reqs.Wood
              );
              var parsedWoodRecived = parseInt(
                ConstructionSiteArray[i].logicObject.data.receivedCrafts.Wood
              );

              if (isNaN(parsedWoodRequired)) {
                parsedWoodRequired = 0;
              }
              if (isNaN(parsedWoodRecived)) {
                parsedWoodRecived = 0;
              }
              woodInNeed += parsedWoodRequired - parsedWoodRecived;
            }
          }
        }
        if (
          woodInNeed + parseInt(WoodStop.value) >=
          Game.town.GetStoredCrafts()["Wood"]
        ) {
          isConstructionNeedWood = true;
        }
        return isConstructionNeedWood;
      }
    }
  }

  function getAllCrafter() {
    const CrafterArray = Object.values(Game.town.objectDict).filter(
      (o) => o.logicType === "Crafter"
    );
  }

  function freeStorage() {
    //ToDo: If storage is full check if you can sell something
    const StorageArray = Object.values(Game.town.objectDict).filter(
      (o) => o.logicType === "Storage"
    );
  }

  function sell() {
    const depotObjArray = Object.values(Game.town.objectDict).filter(
      (o) => o.logicType === "Trade"
    );

    var depotObj = "";
    var busyDepotKey = "";
    var depotKey = "";
    var busyDepot = [];
    var i, j;

    if (Game.town.tradesList.length > 0) {
      for (j = 0; j < Game.town.tradesList.length; j++) {
        busyDepotKey =
          "[" +
          Game.town.tradesList[j].source.x +
          ", " +
          "0, " +
          Game.town.tradesList[j].source.z +
          "]";
        var startTime = new Date(Game.town.tradesList[j].startTime);
        var endTime = new Date(
          startTime.getTime() + Game.town.tradesList[j].duration
        );
        var currentTime = new Date();
        console.log("Depot Busy -- " + busyDepotKey);
        if (currentTime.getTime() - endTime.getTime() > 1000) {
          busyDepot.push(busyDepotKey);
          console.log("Depot Busy -- " + busyDepotKey);
          Game.town.objectDict[busyDepotKey].logicObject.OnTapped();
        } else {
          busyDepot.push(busyDepotKey);
          console.log("Depot Busy -- " + busyDepotKey);
        }
      }
    }

    if (Game.town.GetStoredCrafts()["Gasoline"] > 0) {
      var itemtoSell;
      var nCountItem;

      var activeItemsList = document.getElementById("activeItemsList");
      var craftedItem = activeItemsList.getElementsByTagName("DIV");

      for (i = 0; i < craftedItem.length; i++) {
        itemtoSell = craftedItem[i].getAttribute("data-key");
        nCountItem = craftedItem[i].getAttribute("data-amount");
        if (Game.town.GetStoredCrafts()[itemtoSell] != undefined) {
          if (Game.town.GetStoredCrafts()[itemtoSell] >= nCountItem) {
            break;
          }
        }
      }
      if (Game.town.GetStoredCrafts()[itemtoSell] >= nCountItem) {
        if (nCountItem >= 100) {
          for (var k = 0; k < depotObjArray.length; k++) {
            if (depotObjArray[k].type == "Freight_Pier") {
              depotObj = depotObjArray[k];
              depotKey =
                "[" + depotObj.townX + ", " + "0, " + depotObj.townZ + "]";
              if (Game.town.tradesList.length > 0) {
                for (j = 0; j < Game.town.tradesList.length; j++) {
                  busyDepotKey =
                    "[" +
                    Game.town.tradesList[j].source.x +
                    ", " +
                    "0, " +
                    Game.town.tradesList[j].source.z +
                    "]";
                  if (depotKey == busyDepotKey) {
                    depotObj = "";
                  }
                }
              }

              if (depotObj != "") {
                break;
              }
            }
          }
        } else {
          for (var l = 0; l < depotObjArray.length; l++) {
            if (depotObjArray[l].type != "Freight_Pier") {
              depotObj = depotObjArray[l];
              depotKey =
                "[" + depotObj.townX + ", " + "0, " + depotObj.townZ + "]";
              if (Game.town.tradesList.length > 0) {
                for (j = 0; j < Game.town.tradesList.length; j++) {
                  busyDepotKey =
                    "[" +
                    Game.town.tradesList[j].source.x +
                    ", " +
                    "0, " +
                    Game.town.tradesList[j].source.z +
                    "]";
                  if (depotKey == busyDepotKey) {
                    depotObj = "";
                  }
                }
              }

              if (depotObj != "") {
                break;
              }
            }
          }
        }

        if (depotObj != "") {
          if (StartSellingCheckBox.checked) {
            Game.app.fire("SellClicked", {
              x: depotObj.townX,
              z: depotObj.townZ,
            });
            setTimeout(function () {
              let craftTarget = document.getElementById("trade-craft-target");
              craftTarget
                .querySelectorAll('[data-name="' + itemtoSell + '"]')[0]
                .click();
              setTimeout(function () {
                document
                  .getElementById("destination-target")
                  .getElementsByClassName("destination")[0]
                  .getElementsByClassName("sell-button")[0]
                  .click();
              }, 700);
            }, 1500);
          }
        }
      }
    }
  }
})();
