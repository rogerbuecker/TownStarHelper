// ==UserScript==
// @name         Town Star Helper
// @namespace    http://tampermonkey.net/
// @version      0.9.3
// @description  Town Star Helper fix update
// @author       Roger - Modify from exisiting scripts from  Groove
// @match        https://townstar.sandbox-games.com/*
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";
  
    const sellTimer = 10; // Seconds between selling
    let trackedItems = [];
    let sellingActive = 0;
    let trackingActive = 0;
    let updateActive = 0;
  
    new MutationObserver(function (_mutations) {
      let airdropcollected = 0;
      if (
        document.getElementsByClassName("hud-jimmy-button")[0] &&
        document.getElementsByClassName("hud-jimmy-button")[0].style.display !=
          "none"
      ) {
        document.getElementsByClassName("hud-jimmy-button")[0].click();
        document
          .getElementById("Deliver-Request")
          .getElementsByClassName("yes")[0]
          .click();
      }
      if (
        document.getElementsByClassName("hud-airdrop-button")[0] &&
        document.getElementsByClassName("hud-airdrop-button")[0].style.display !=
          "none"
      ) {
        if (airdropcollected == 0) {
          airdropcollected = 1;
          document.getElementsByClassName("hud-airdrop-button")[0].click();
          document
            .getElementsByClassName("air-drop")[0]
            .getElementsByClassName("yes")[0]
            .click();
        }
      }
      if (
        document.getElementById("playnow-container") &&
        document.getElementById("playnow-container").style.visibility !== "hidden"
      ) {
        document.getElementById("playButton").click();
      }
  
      if (typeof Game != "undefined" && Game.town != null) {
        if (trackingActive == 0) {
          trackingActive = 1;
          LoadProductionMonitor();
        }
        if (sellingActive == 0) {
          setTimeout(function () {
            if (document.getElementsByClassName("mayhem-logo").length > 0) {
              document.getElementsByClassName("close-button")[21].click();
            }
            if (
              document.querySelector(
                "body > div:nth-child(24) > div > div > div > div > div.header-row > button"
              )
            ) {
              document
                .querySelector(
                  "body > div:nth-child(24) > div > div > div > div > div.header-row > button"
                )
                .click();
            }
            if (
              document.querySelector(
                "#motd > div > div > div > div > div.header-row > button"
              )
            ) {
              document
                .querySelector(
                  "#motd > div > div > div > div > div.header-row > button"
                )
                .click();
            }
          }, 2000);
  
          sellingActive = 1;
          activateSelling();
        }
      }
    }).observe(document, { attributes: true, childList: true, subtree: true });
  
    function update(fromType, toType) {
      if (updateActive === 0) {
        updateActive = Date.now();
      }
  
      let differenceSinceUpdate = Math.round((Date.now() - updateActive) / 1000);
      if (localStorage.getItem("debug") === "true") {
        console.log("UpdateActive: " + differenceSinceUpdate.toString());
      }
  
      if (
        differenceSinceUpdate >= 500 &&
        Game.currency > 180000 &&
        Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Construction_Site"
        ).length < 1
      ) {
        let currentConstructionSites = Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Construction_Site" && o.data.type === toType
        );
  
        let currentUpdate = Object.values(Game.town.objectDict).filter(
          (o) => o.type === fromType
        );
  
        if (currentConstructionSites.length <= 0 && currentUpdate.length > 0) {
          let randomIndex = Math.floor(Math.random() * currentUpdate.length);
          let upgradeCost =
            Game.objectData[toType].BuildCost -
            Game.objectData[fromType].DestroyCost;
          if (localStorage.getItem("debug") === "true") {
            console.log("Update from " + fromType + " to " + toType);
            console.log("Cost" + upgradeCost);
            console.log("X" + currentUpdate[randomIndex].townX);
            console.log("Y" + currentUpdate[randomIndex].townZ);
          }
  
          LEDGER.buyObject(
            currentUpdate[randomIndex].townX,
            currentUpdate[randomIndex].townZ,
            toType,
            {
              currency: upgradeCost,
            }
          ).then(() => {
            Game.town.removeObject({
              x: currentUpdate[randomIndex].townX,
              z: currentUpdate[randomIndex].townZ,
              currencyChange: -upgradeCost,
              withVFX: !1,
            }),
              Game.town.addObject({
                type: ObjectStateConstants.CONSTRUCTION,
                x: currentUpdate[randomIndex].townX,
                z: currentUpdate[randomIndex].townZ,
                rotation: 0,
                data: {
                  type: toType,
                },
                upgrade: !0,
              });
          });
  
          updateActive = Date.now();
        }
      }
    }
  
    function LoadConfig() {
      document.getElementById("ConfigDiv").style.visibility = "visible";
      document.getElementById("configBtn").style.display = "none";
  
      //To close all fullscreens
      for (const element of document.getElementsByClassName("close-button")) {
        element.click();
      }
    }
  
    function CloseConfig() {
      document.getElementById("ConfigDiv").style.visibility = "hidden";
      document.getElementById("configBtn").style.display = "block";
      localStorage.setItem(
        "NightUpdate",
        document.getElementById("NightUpdateCheckBox").checked
      );
      localStorage.setItem(
        "LumberMill",
        document.getElementById("LumberMillCheckBox").checked
      );
      localStorage.setItem(
        "WaterFacility",
        document.getElementById("WaterFacilityCheckBox").checked
      );
      localStorage.setItem(
        "Silica",
        document.getElementById("SilicaCheckBox").checked
      );
      localStorage.setItem(
        "Refinery",
        document.getElementById("RefineryCheckBox").checked
      );
      localStorage.setItem(
        "PowerPlant",
        document.getElementById("PowerPlantCheckBox").checked
      );
      localStorage.setItem(
        "LaborCost",
        Number(document.getElementById("LaborCost").value)
      );
      localStorage.setItem(
        "WoodStop",
        Number(document.getElementById("WoodStop").value)
      );
      localStorage.setItem(
        "EnergyStop",
        Number(document.getElementById("EnergyStop").value)
      );
      localStorage.setItem(
        "GasolineStop",
        Number(document.getElementById("GasolineStop").value)
      );
      localStorage.setItem(
        "WaterStop",
        Number(document.getElementById("WaterStop").value)
      );
      localStorage.setItem(
        "SilicaStop",
        Number(document.getElementById("SilicaStop").value)
      );
      localStorage.setItem(
        "AutoComplete",
        document.getElementById("AutoCompleteCheckBox").checked
      );
      localStorage.setItem(
        "StartSelling",
        document.getElementById("StartSellingCheckBox").checked
      );
    }
  
    async function collectTownCoinIfNeedet() {
      let challenge = await Game.challenge;
      if (challenge) {
        if (!challenge.claimed) {
          if (localStorage.getItem("debug") === "true") {
            console.log("collect Town Coin");
          }
          let collectEarningsResponse = await Game.collectEarnings();
          if (localStorage.getItem("debug") === "true") {
            console.log(collectEarningsResponse.message);
          }
        }
      }
    }
  
    function LoadProductionMonitor() {
      if (localStorage.getItem("debug") === "true") {
        console.log("LoadProductionMonitor");
      }
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
  
    function activateSelling() {
      let sNightUpdate = localStorage.getItem("NightUpdate");
      let sLumberMill = localStorage.getItem("LumberMill");
      let sWaterFacility = localStorage.getItem("WaterFacility");
      let sSilica = localStorage.getItem("Silica");
      let sRefinery = localStorage.getItem("Refinery");
      let sPowerPlant = localStorage.getItem("PowerPlant");
      let sLaborCost = localStorage.getItem("LaborCost");
      let sWoodStop = localStorage.getItem("WoodStop");
      let sEnergyStop = localStorage.getItem("EnergyStop");
      let sGasolineStop = localStorage.getItem("GasolineStop");
      let sWaterStop = localStorage.getItem("WaterStop");
      let sSilicaStop = localStorage.getItem("SilicaStop");
      let sAutoComplete = localStorage.getItem("AutoComplete");
      let sStartSelling = localStorage.getItem("StartSelling");
      let sCollectTownCoin = localStorage.getItem("CollectTownCoin");
  
      let bothItemList = document.createElement("DIV");
      let allItemsList = document.createElement("DIV");
      let activeItemsList = document.createElement("DIV");
  
      bothItemList.setAttribute("style", "height:45%;");
  
      allItemsList.setAttribute(
        "style",
        "width: 50%;float: left;height: 100%;position: relative;overflow-y: auto;"
      );
      allItemsList.id = "allItemsList";
  
      if (localStorage.getItem("allItemsList")) {
        allItemsList.innerHTML = localStorage.getItem("allItemsList");
      } else {
        for (let key in Game.craftData) {
          const item = Game.craftData[key];
          let option = document.createElement("DIV");
          let itemInfo =
            key + " " + item.CityPoints + "pt " + item.CityPrice + "$";
          option.innerText = key;
          option.title = itemInfo;
          option.setAttribute("data-key", key);
          allItemsList.appendChild(option);
        }
      }
  
      activeItemsList.setAttribute(
        "style",
        "width: 50%;float: left;height: 100%;position: relative;overflow-y: auto;"
      );
      activeItemsList.id = "activeItemsList";
  
      if (localStorage.getItem("activeItemsList")) {
        activeItemsList.innerHTML = localStorage.getItem("activeItemsList");
      }
  
      bothItemList.append(allItemsList);
      bothItemList.append(activeItemsList);
  
      let node = document.createElement("DIV");
      let Loadbtn = document.createElement("BUTTON");
  
      let node2 = document.createElement("DIV");
      let Savebtn = document.createElement("BUTTON");
      let lumberMillCheckBox = document.createElement("Input");
      let nightUpdateCheckBox = document.createElement("Input");
      let waterFacilityCheckBox = document.createElement("Input");
      let silicaCheckBox = document.createElement("Input");
      let RefineryCheckBox = document.createElement("Input");
      let PowerPlantCheckBox = document.createElement("Input");
      let AutoCompleteCheckBox = document.createElement("Input");
      let LaborCost = document.createElement("Input");
      let WoodStop = document.createElement("Input");
      let EnergyStop = document.createElement("Input");
      let GasolineStop = document.createElement("Input");
      let WaterStop = document.createElement("Input");
      let SilicaStop = document.createElement("Input");
      let CollectTownCoinCheckBox = document.createElement("Input");
  
      let StartSellingCheckBox = document.createElement("Input");
      Loadbtn.setAttribute("id", "configBtn");
      Loadbtn.textContent = "Open";
      Loadbtn.onclick = LoadConfig;
  
      Savebtn.setAttribute("id", "Savebtn");
      Savebtn.textContent = "Close config";
      Savebtn.onclick = CloseConfig;
  
      nightUpdateCheckBox.type = "checkbox";
      nightUpdateCheckBox.style.height = "12px";
      nightUpdateCheckBox.setAttribute("id", "NightUpdateCheckBox");
      if (sNightUpdate != null) {
        if (sNightUpdate == "false") {
          nightUpdateCheckBox.checked = false;
        } else {
          nightUpdateCheckBox.checked = true;
        }
      }
  
      lumberMillCheckBox.type = "checkbox";
      lumberMillCheckBox.style.height = "12px";
      lumberMillCheckBox.setAttribute("id", "LumberMillCheckBox");
      if (sLumberMill != null) {
        if (sLumberMill == "false") {
          lumberMillCheckBox.checked = false;
        } else {
          lumberMillCheckBox.checked = true;
        }
      }
  
      waterFacilityCheckBox.type = "checkbox";
      waterFacilityCheckBox.style.height = "12px";
      waterFacilityCheckBox.setAttribute("id", "WaterFacilityCheckBox");
      if (sWaterFacility != null) {
        if (sWaterFacility == "false") {
          waterFacilityCheckBox.checked = false;
        } else {
          waterFacilityCheckBox.checked = true;
        }
      }

      silicaCheckBox.type = "checkbox";
      silicaCheckBox.style.height = "12px";
      silicaCheckBox.setAttribute("id", "SilicaCheckBox");
      if (sSilica != null) {
        if (sSilica == "false") {
            silicaCheckBox.checked = false;
        } else {
            silicaCheckBox.checked = true;
        }
      }
  
      PowerPlantCheckBox.type = "checkbox";
      PowerPlantCheckBox.style.height = "12px";
      PowerPlantCheckBox.setAttribute("id", "PowerPlantCheckBox");
      if (sPowerPlant != null) {
        if (sPowerPlant == "false") {
          PowerPlantCheckBox.checked = false;
        } else {
          PowerPlantCheckBox.checked = true;
        }
      }
  
      RefineryCheckBox.type = "checkbox";
      RefineryCheckBox.style.height = "12px";
      RefineryCheckBox.setAttribute("id", "RefineryCheckBox");
      if (sRefinery != null) {
        if (sRefinery == "false") {
          RefineryCheckBox.checked = false;
        } else {
          RefineryCheckBox.checked = true;
        }
      }
  
      AutoCompleteCheckBox.type = "checkbox";
      AutoCompleteCheckBox.style.height = "12px";
      AutoCompleteCheckBox.setAttribute("id", "AutoCompleteCheckBox");
      if (sAutoComplete != null) {
        if (sAutoComplete == "false") {
          AutoCompleteCheckBox.checked = false;
        } else {
          AutoCompleteCheckBox.checked = true;
        }
      }
  
      LaborCost.type = "number";
      LaborCost.style.height = "10px";
      LaborCost.style.width = "50px";
      LaborCost.style.fontSize = "12px";
      LaborCost.style.padding = "4px";
      LaborCost.style.marginLeft = "5px";
      LaborCost.style.borderRadius = "0px";
      LaborCost.style.textAlign = "right";
      LaborCost.setAttribute("id", "LaborCost");
      LaborCost.value = 20;
      if (sLaborCost != null) {
        LaborCost.value = Number(sLaborCost);
      }
  
      WoodStop.type = "number";
      WoodStop.style.height = "10px";
      WoodStop.style.width = "50px";
      WoodStop.style.fontSize = "12px";
      WoodStop.style.padding = "4px";
      WoodStop.style.marginLeft = "5px";
      WoodStop.style.borderRadius = "0px";
      WoodStop.style.textAlign = "right";
      WoodStop.setAttribute("id", "WoodStop");
      WoodStop.value = 5;
      if (sWoodStop != null) {
        WoodStop.value = Number(sWoodStop);
      }
  
      EnergyStop.type = "number";
      EnergyStop.style.height = "10px";
      EnergyStop.style.width = "50px";
      EnergyStop.style.fontSize = "12px";
      EnergyStop.style.padding = "4px";
      EnergyStop.style.marginLeft = "5px";
      EnergyStop.style.borderRadius = "0px";
      EnergyStop.style.textAlign = "right";
      EnergyStop.setAttribute("id", "EnergyStop");
      EnergyStop.value = 8;
      if (sEnergyStop != null) {
        EnergyStop.value = Number(sEnergyStop);
      }
  
      GasolineStop.type = "number";
      GasolineStop.style.height = "10px";
      GasolineStop.style.width = "50px";
      GasolineStop.style.fontSize = "12px";
      GasolineStop.style.padding = "4px";
      GasolineStop.style.marginLeft = "5px";
      GasolineStop.style.borderRadius = "0px";
      GasolineStop.style.textAlign = "right";
      GasolineStop.setAttribute("id", "GasolineStop");
      GasolineStop.value = 8;
      if (sGasolineStop != null) {
        GasolineStop.value = Number(sGasolineStop);
      }
  
      WaterStop.type = "number";
      WaterStop.style.height = "10px";
      WaterStop.style.width = "50px";
      WaterStop.style.fontSize = "12px";
      WaterStop.style.padding = "4px";
      WaterStop.style.marginLeft = "5px";
      WaterStop.style.borderRadius = "0px";
      WaterStop.style.textAlign = "right";
      WaterStop.setAttribute("id", "WaterStop");
      WaterStop.value = 10;
      if (sWaterStop != null) {
        WaterStop.value = Number(sWaterStop);
      }

      SilicaStop.type = "number";
      SilicaStop.style.height = "10px";
      SilicaStop.style.width = "50px";
      SilicaStop.style.fontSize = "12px";
      SilicaStop.style.padding = "4px";
      SilicaStop.style.marginLeft = "5px";
      SilicaStop.style.borderRadius = "0px";
      SilicaStop.style.textAlign = "right";
      SilicaStop.setAttribute("id", "SilicaStop");
      SilicaStop.value = 10;
      if (sSilicaStop != null) {
        SilicaStop.value = Number(sSilicaStop);
      }
  
      StartSellingCheckBox.type = "checkbox";
      StartSellingCheckBox.style.height = "12px";
      StartSellingCheckBox.setAttribute("id", "StartSellingCheckBox");
      if (sStartSelling != null) {
        if (sStartSelling == "false") {
          StartSellingCheckBox.checked = false;
        } else {
          StartSellingCheckBox.checked = true;
        }
      }
  
      CollectTownCoinCheckBox.type = "checkbox";
      CollectTownCoinCheckBox.style.height = "12px";
      CollectTownCoinCheckBox.setAttribute("id", "CollectTownCoinCheckBox");
      CollectTownCoinCheckBox.checked = true;
      if (sCollectTownCoin != null) {
        if (sCollectTownCoin == "false") {
          CollectTownCoinCheckBox.checked = false;
        } else {
          CollectTownCoinCheckBox.checked = true;
        }
      }
  
      node.appendChild(Loadbtn);
      node2.id = "ConfigDiv";
  
      let x = document.createElement("STRONG");
      let t = document.createTextNode("Items:");
      x.appendChild(t);
  
      node2.append(x);
      node2.append(bothItemList);
  
      node2.setAttribute(
        "style",
        "position: fixed;z-index: 1000; left: 25%; width: 50%; height: 100%;background-color: #edededd6;visibility:hidden; padding: 10px"
      );
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Night Update Mode :");
      node2.appendChild(nightUpdateCheckBox);
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Turn on/off Lumber Mill :");
      node2.appendChild(lumberMillCheckBox);
      node2.appendChild(document.createElement("br"));
      node2.append("Wood to stop :");
      node2.appendChild(WoodStop);
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Turn on/off Water Facility :");
      node2.appendChild(waterFacilityCheckBox);
      node2.appendChild(document.createElement("br"));
      node2.append("Waterdrum to stop :");
      node2.appendChild(WaterStop);
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Turn on/off Silica :");
      node2.appendChild(silicaCheckBox);
      node2.appendChild(document.createElement("br"));
      node2.append("Silica to stop :");
      node2.appendChild(SilicaStop);
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Turn on/off PowerPlant :");
      node2.appendChild(PowerPlantCheckBox);
      node2.appendChild(document.createElement("br"));
      node2.append("Energy to stop :");
      node2.appendChild(EnergyStop);
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Switch Refinery to Jet Fuel:");
      node2.appendChild(RefineryCheckBox);
      node2.appendChild(document.createElement("br"));
      node2.append("Gasoline to switch :");
      node2.appendChild(GasolineStop);
  
      node2.appendChild(document.createElement("hr"));
      node2.append("Auto Complete Construction Site :");
      node2.appendChild(AutoCompleteCheckBox);
      node2.appendChild(document.createElement("br"));
      node2.append("Labor Cost :");
      node2.appendChild(LaborCost);
  
      node2.appendChild(document.createElement("hr"));
  
      node2.append("Start Selling :");
      node2.appendChild(StartSellingCheckBox);
      node2.appendChild(document.createElement("hr"));
  
      node2.append("Collect Town Coin :");
      node2.appendChild(CollectTownCoinCheckBox);
      node2.appendChild(document.createElement("hr"));
  
      node2.appendChild(Savebtn);
  
      node.appendChild(node2);
      node.setAttribute("style", "position:fixed;z-index:1000");
  
      document.getElementsByTagName("Body")[0].appendChild(node);
  
      allItemsList = document.getElementById("allItemsList");
      activeItemsList = document.getElementById("activeItemsList");
  
      Sortable.create(allItemsList, {
        group: {
          name: "shared",
        },
        onSort: (_evt) => {
          localStorage.setItem("allItemsList", allItemsList.innerHTML);
        },
        animation: 150,
        sort: false, // To disable sorting: set sort to false
      });
      Sortable.create(activeItemsList, {
        group: "shared",
        onSort: (_evt) => {
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
  
      let start = GM_getValue("start", Date.now());
      GM_setValue("start", start);
      setTimeout(function () {
        let tempSpawnCon = Trade.prototype.SpawnConnection;
        Trade.prototype.SpawnConnection = function (r) {
          tempSpawnCon.call(this, r);
          GM_setValue(
            Math.round((Date.now() - start) / 1000).toString(),
            r.craftType
          );
        };
      }, 10000);
  
      window.mySellTimer = setInterval(function () {
        let depotObjArray = Object.values(Game.town.objectDict).filter(
          (o) => o.logicType === "Trade"
        );
        let waterFacilityArray = Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Water_Facility"
        );
        let silicaArray = Object.values(Game.town.objectDict).filter(
            (o) => o.type === "Sand_Mine"
          );
        let powerPlantArray = Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Power_Plant" || o.type === "Nuclear_Power"
        );
        let lumberMillArray = Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Lumber_Mill"
        );
        let constructionSiteArray = Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Construction_Site"
        );
  
        let refineryArray = Object.values(Game.town.objectDict).filter(
          (o) => o.type === "Refinery"
        );
  
        let isConstructionNeedWood = false;
        let depotObj = "";
        let busyDepotKey = "";
        let depotKey = "";
        let busyDepot = [];
        let i, j;
  
        if (CollectTownCoinCheckBox.checked) {
          collectTownCoinIfNeedet();
        }
  
        let woodInNeed = 0;
        if (constructionSiteArray.length > 0 && AutoCompleteCheckBox.checked) {
          for (i = 0; i < constructionSiteArray.length; i++) {
            if (constructionSiteArray[i].logicObject.data.state == "Complete") {
              if (
                Game.objectData[constructionSiteArray[i].logicObject.data.type]
                  .LaborCost <= LaborCost.value
              ) {
                constructionSiteArray[i].logicObject.OnTapped();
              }
            } else {
              if (
                constructionSiteArray[i].logicObject.constructionData.reqs.Wood !=
                undefined
              ) {
                if (
                  constructionSiteArray[i].logicObject.data.receivedCrafts.Wood ==
                    undefined ||
                  constructionSiteArray[i].logicObject.data.receivedCrafts.Wood <
                    constructionSiteArray[i].logicObject.constructionData.reqs
                      .Wood
                ) {
                  let parsedWoodRequired = parseInt(
                    constructionSiteArray[i].logicObject.constructionData.reqs
                      .Wood
                  );
                  let parsedWoodRecived = parseInt(
                    constructionSiteArray[i].logicObject.data.receivedCrafts.Wood
                  );
  
                  if (isNaN(parsedWoodRequired)) {
                    parsedWoodRequired = 0;
                  }
                  if (isNaN(parsedWoodRecived)) {
                    parsedWoodRecived = 0;
                  }
                  woodInNeed += parsedWoodRequired - parsedWoodRecived;
  
                  if (localStorage.getItem("debug") === "true") {
                    console.log("wood in need " + woodInNeed);
                    console.log("wood required " + parsedWoodRequired);
                    console.log("wood recived " + parsedWoodRecived);
                  }
                }
              }
            }
  
            let woodAmount = Game.town.GetStoredCrafts()["Wood"];
            if (isNaN(woodAmount)) {
              woodAmount = 0;
            }
  
            if (woodInNeed + parseInt(WoodStop.value) > woodAmount) {
              isConstructionNeedWood = true;
            }
          }
        }
  
        if (waterFacilityArray.length > 0 && waterFacilityCheckBox.checked) {
          if (Game.town.GetStoredCrafts()["Water_Drum"] >= WaterStop.value) {
            for (i = 0; i < waterFacilityArray.length; i++) {
              if (
                waterFacilityArray[i].logicObject.data.craft == "Water_Drum" &&
                waterFacilityArray[i].logicObject.data.state != "Produce"
              ) {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Turning off Water Facility");
                }
                waterFacilityArray[i].logicObject.SetCraft("None");
              }
            }
          } else {
            for (i = 0; i < waterFacilityArray.length; i++) {
              if (waterFacilityArray[i].logicObject.data.craft == "None") {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Turning on Water Facility");
                }
                waterFacilityArray[i].logicObject.SetCraft("Water_Drum");
              }
            }
          }
        }
  
        if (silicaArray.length > 0 && silicaCheckBox.checked) {
            if (Game.town.GetStoredCrafts()["Silica"] >= SilicaStop.value) {
              for (i = 0; i < silicaArray.length; i++) {
                if (
                    silicaArray[i].logicObject.data.craft == "Silica" &&
                    silicaArray[i].logicObject.data.state != "Produce"
                ) {
                  if (localStorage.getItem("debug") === "true") {
                    console.log("Turning off Silica");
                  }
                  silicaArray[i].logicObject.SetCraft("None");
                }
              }
            } else {
              for (i = 0; i < silicaArray.length; i++) {
                if (silicaArray[i].logicObject.data.craft == "None") {
                  if (localStorage.getItem("debug") === "true") {
                    console.log("Turning on Silica");
                  }
                  silicaArray[i].logicObject.SetCraft("Silica");
                }
              }
            }
          }

        if (powerPlantArray.length > 0 && PowerPlantCheckBox.checked) {
          if (Game.town.GetStoredCrafts()["Energy"] >= EnergyStop.value) {
            for (i = 0; i < powerPlantArray.length; i++) {
              if (
                powerPlantArray[i].logicObject.data.craft == "Energy" &&
                powerPlantArray[i].logicObject.data.state != "Produce"
              ) {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Turning off Power Plant");
                }
                powerPlantArray[i].logicObject.SetCraft("None");
              }
            }
          } else {
            for (i = 0; i < powerPlantArray.length; i++) {
              if (powerPlantArray[i].logicObject.data.craft == "None") {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Turning on Power Plant");
                }
                powerPlantArray[i].logicObject.SetCraft("Energy");
              }
            }
          }
        }
  
        if (refineryArray.length > 0 && RefineryCheckBox.checked) {
          if (Game.town.GetStoredCrafts()["Gasoline"] >= GasolineStop.value) {
            for (i = 0; i < refineryArray.length; i++) {
              if (
                refineryArray[i].logicObject.data.craft == "Gasoline" &&
                refineryArray[i].logicObject.data.state != "Produce"
              ) {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Switch Refinery to Jet Fuel");
                }
                refineryArray[i].logicObject.SetCraft("Jet_Fuel");
              }
            }
          } else {
            for (i = 0; i < refineryArray.length; i++) {
              if (
                refineryArray[i].logicObject.data.craft == "Jet_Fuel" &&
                refineryArray[i].logicObject.data.state != "Produce"
              ) {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Switch Refinery to Gasolin");
                }
                refineryArray[i].logicObject.SetCraft("Gasoline");
              }
            }
          }
        }
  
        if (nightUpdateCheckBox.checked) {
          let magicFairydice = Math.floor(Math.random() * 4);
          switch (magicFairydice) {
            case 0:
              update("Dirt_Road", "Paved_Road");
              break;
            case 1:
              update("Lumberjack_House", "The_Logger_House");
              break;
            case 2:
              update("Farm_House", "Farm_Tractor");
              break;
            case 3:
              update("Ranch_House", "ATV");
              break;
            default:
              console.log("updateSometingError " + magicFairydice);
              break;
          }
        }
  
        if (lumberMillArray.length > 0 && lumberMillCheckBox.checked) {
          let woodAmount = Game.town.GetStoredCrafts()["Wood"];
          if (isNaN(woodAmount)) {
            woodAmount = 0;
          }
  
          if (localStorage.getItem("debug") === "true") {
            console.log(woodInNeed + parseInt(WoodStop.value));
            console.log(woodAmount);
          }
          if (woodAmount <= WoodStop.value || isConstructionNeedWood) {
            for (i = 0; i < lumberMillArray.length; i++) {
              if (
                lumberMillArray[i].logicObject.data.craft == "Lumber" &&
                lumberMillArray[i].logicObject.data.state != "Produce" &&
                lumberMillArray[i].logicObject.data.reqList.Wood > 4
              ) {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Turning off Lumber Mill");
                }
                lumberMillArray[i].logicObject.SetCraft("None");
              }
            }
          } else {
            for (i = 0; i < lumberMillArray.length; i++) {
              if (lumberMillArray[i].logicObject.data.craft == "None") {
                if (localStorage.getItem("debug") === "true") {
                  console.log("Turning on Lumber Mill");
                }
                lumberMillArray[i].logicObject.SetCraft("Lumber");
              }
            }
          }
        }
  
        if (Game.town.tradesList.length > 0) {
          for (j = 0; j < Game.town.tradesList.length; j++) {
            busyDepotKey =
              "[" +
              Game.town.tradesList[j].source.x +
              ", " +
              "0, " +
              Game.town.tradesList[j].source.z +
              "]";
            let startTime = new Date(Game.town.tradesList[j].startTime);
            let endTime = new Date(
              startTime.getTime() + Game.town.tradesList[j].duration
            );
            let currentTime = new Date();
            if (localStorage.getItem("debug") === "true") {
              console.log("Depot Busy -- " + busyDepotKey);
            }
            if (currentTime.getTime() - endTime.getTime() > 1000) {
              busyDepot.push(busyDepotKey);
              if (localStorage.getItem("debug") === "true") {
                console.log("Depot Busy -- " + busyDepotKey);
              }
              Game.town.objectDict[busyDepotKey].logicObject.OnTapped();
            } else {
              busyDepot.push(busyDepotKey);
              if (localStorage.getItem("debug") === "true") {
                console.log("Depot Busy -- " + busyDepotKey);
              }
            }
          }
        }
  
        if (Game.town.GetStoredCrafts()["Gasoline"] > 0) {
          let itemtoSell;
          let nCountItem;
  
          let activeItemsList = document.getElementById("activeItemsList");
          let craftedItem = activeItemsList.getElementsByTagName("DIV");
  
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
            if (
              nCountItem >= 100 &&
              Game.town.GetStoredCrafts()["Gasoline"] > 43
            ) {
              for (const element of depotObjArray) {
                if (element.type == "Freight_Pier") {
                  depotObj = element;
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
            } else if (nCountItem <= 100) {
              for (const element of depotObjArray) {
                if (element.type != "Freight_Pier") {
                  depotObj = element;
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
                }, 700);
              }
            }
          }
        }
      }, sellTimer * 1000);
    }
  })();
  