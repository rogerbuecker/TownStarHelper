// ==UserScript==
// @name         Town Star Helper DEV
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Town Star Helper
// @author       Roger - Modify from exisiting scripts from  Groove
// @match        https://townstar.sandbox-games.com/launch/
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @resource     IMPORTED_CSS https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const my_css = GM_getResourceText("IMPORTED_CSS");
  //GM_addStyle(my_css);

  const sellTimer = 5; // Seconds between selling
  var craftedItem = [];
  var trackedItems = [];
  let configOpen = false;
  let sellingActive = 0;
  let trackingActive = 0;

  new MutationObserver(function (mutations) {
    console.log("MutationObserver");

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
              "body > div:nth-child(27) > div > div > div > div > div.header-row > button"
            )
          ) {
            document
              .querySelector(
                "body > div:nth-child(27) > div > div > div > div > div.header-row > button"
              )
              .click();
          }
        }, 2000);

        //add event listener key s
        document
          .getElementById("application-canvas")
          .addEventListener("keydown", function (event) {
            if (event.key === "s") {
              toggleConfig();
            }
          });

        sellingActive = 1;
        activateSelling();
      }
    }
  }).observe(document, { attributes: true, childList: true, subtree: true });

  function toggleConfig() {
    if (configOpen) {
      document.getElementById("ConfigDiv").style.display = "none";
      document.getElementById("ConfigDiv").style.visibility = "hidden";
      saveConfigToLocalStorage();
      configOpen = false;
    } else {
      document.getElementById("ConfigDiv").style.visibility = "visible";
      document.getElementById("ConfigDiv").style.display = "block";
      for (
        var i = 0;
        i < document.getElementsByClassName("close-button").length;
        i++
      ) {
        document.getElementsByClassName("close-button")[i].click();
      }
      configOpen = true;
    }
  }

  function addToList() {
    var itemListArray = JSON.parse(localStorage.getItem("ItemToSell"));
    if (
      itemListArray.findIndex(
        (e) => e.name === document.getElementById("ListOfAllItemInput").value
      ) > -1
    ) {
      itemListArray.splice(
        itemListArray.findIndex(
          (e) => e.name === document.getElementById("ListOfAllItemInput").value
        ),
        1
      );
    }
    var count = Number(document.getElementById("SellingAmount").value);
    var gasolin = Number(document.getElementById("SellingAmount").value);
    if(!gasolin){
      gasolin = 0;
    }
    var name = document.getElementById("ListOfAllItemInput").value;
    if (count < 10) {
      count = 10;
    }
    itemListArray.push({ name: name, count: count, gasolin: gasolin });
    localStorage.setItem("ItemToSell", JSON.stringify(itemListArray));

    var option = document.createElement("li");
      option.className =
        "list-group-item d-flex justify-content-between align-items-center";

      var titleSpan = document.createElement("span");
      titleSpan.id = "title";
      titleSpan.innerHTML = name;
      var countSpan = document.createElement("span");

      countSpan.innerHTML = count;
      countSpan.className = "badge badge-primary badge-pill";

      option.appendChild(titleSpan);
      option.appendChild(countSpan);
      document.getElementById("productList").appendChild(option);

  }

  function removeFromList() {
    var itemListArray = JSON.parse(localStorage.getItem("ItemToSell"));
    if (
      itemListArray.findIndex(
        (e) => e.name === document.getElementById("ListOfAllItemInput").value
      ) > -1
    ) {
      itemListArray.splice(
        itemListArray.findIndex(
          (e) => e.name === document.getElementById("ListOfAllItemInput").value
        ),
        1
      );
    }
    localStorage.setItem("ItemToSell", JSON.stringify(itemListArray));
  }

  function saveConfigToLocalStorage() {
    localStorage.setItem(
      "LumberMill",
      document.getElementById("LumberMillCheckBox").checked
    );
    localStorage.setItem(
      "Refinery",
      document.getElementById("RefineryCheckBox").checked
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
      "AutoComplete",
      document.getElementById("AutoCompleteCheckBox").checked
    );
    localStorage.setItem(
      "StartSelling",
      document.getElementById("StartSellingCheckBox").checked
    );
    localStorage.setItem(
      "ClearConsole",
      document.getElementById("ClearConsoleCheckBox").checked
    );

    var titles = $('span[id^=title]').map(function(idx, elem) {
      return $(elem).text();
    }).get();

    localStorage.setItem(
      "ItemToSell",
      JSON.stringify(titles)
    );
  }

  function ClearData() {
    localStorage.removeItem("ItemToSell");
  }

  async function collectTownCoinIfNeedet() {
    if (!Game.challenge.claimed) {
      console.log("collect Town Coin");
      let collectEarningsResponse = await Game.collectEarnings();
      console.log(collectEarningsResponse.message);
    }
  }

  function LoadProductionMonitor() {
    console.log("LoadProductionMonitor");
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
    console.log("activateSelling");
    var listItem = localStorage.getItem("ItemToSell");
    var sLumberMill = localStorage.getItem("LumberMill");
    var sRefinery = localStorage.getItem("Refinery");
    var sLaborCost = localStorage.getItem("LaborCost");
    var sWoodStop = localStorage.getItem("WoodStop");
    var sEnergyStop = localStorage.getItem("EnergyStop");
    var sAutoComplete = localStorage.getItem("AutoComplete");
    var sStartSelling = localStorage.getItem("StartSelling");
    var sClearConsole = localStorage.getItem("ClearConsole");
    var sCollectTownCoin = localStorage.getItem("CollectTownCoin");

    if (listItem != null) {
      craftedItem = JSON.parse(listItem);
    }

    var sellingAmount = document.createElement("Input");
    var addToListBtn = document.createElement("BUTTON");
    var removeListBtn = document.createElement("BUTTON");

    var itemlistInput = document.createElement("Input");
    itemlistInput.id = "ListOfAllItemInput";
    itemlistInput.setAttribute("list", "ListOfAllItem");

    var itemlist = document.createElement("datalist");
    itemlist.id = "ListOfAllItem";

    for (var item in Game.craftData) {
      var option = document.createElement("option");
      option.value = item;
      itemlist.appendChild(option);
    }

    var productList = document.createElement("div");
    productList.id = "productList";
    productList.className = "list-group list-group-flush";

    craftedItem.forEach((item) => {
      var option = document.createElement("li");
      option.className =
        "list-group-item d-flex justify-content-between align-items-center";

      var titleSpan = document.createElement("span");
      titleSpan.id = "title";
      titleSpan.innerHTML = item.name;
      var countSpan = document.createElement("span");

      countSpan.innerHTML = item.count;
      countSpan.className = "badge badge-primary badge-pill";

      option.appendChild(titleSpan);
      option.appendChild(countSpan);
      productList.appendChild(option);
    });

    new Sortable(productList, {
      animation: 150,
      ghostClass: "blue-background-class",
    });

    var node = document.createElement("DIV");
    var node2 = document.createElement("DIV");
    var ClearStorageDataBtn = document.createElement("BUTTON");
    var lumberMillCheckBox = document.createElement("Input");
    var RefineryCheckBox = document.createElement("Input");
    var AutoCompleteCheckBox = document.createElement("Input");
    var LaborCost = document.createElement("Input");
    var WoodStop = document.createElement("Input");
    var EnergyStop = document.createElement("Input");
    var ClearConsoleLogCheckBox = document.createElement("Input");
    var CollectTownCoinCheckBox = document.createElement("Input");

    var StartSellingCheckBox = document.createElement("Input");

    ClearStorageDataBtn.setAttribute("id", "ClearDataBtn");
    ClearStorageDataBtn.textContent = "Clear Storage Data";
    ClearStorageDataBtn.onclick = ClearData;

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

    ClearConsoleLogCheckBox.type = "checkbox";
    ClearConsoleLogCheckBox.style.height = "12px";
    ClearConsoleLogCheckBox.setAttribute("id", "ClearConsoleCheckBox");
    ClearConsoleLogCheckBox.checked = true;
    if (sClearConsole != null) {
      if (sClearConsole == "false") {
        ClearConsoleLogCheckBox.checked = false;
      } else {
        ClearConsoleLogCheckBox.checked = true;
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

    node2.id = "ConfigDiv";

    sellingAmount.type = "number";
    sellingAmount.style.fontSize = "12px";
    sellingAmount.style.padding = "5px";
    sellingAmount.style.marginLeft = "10px";
    sellingAmount.style.height = "25px";
    sellingAmount.style.borderRadius = "0px";
    sellingAmount.style.textAlign = "right";
    sellingAmount.setAttribute("id", "SellingAmount");
    sellingAmount.min = 10;
    sellingAmount.value = 10;

    itemlist.style.fontSize = "13px";
    itemlist.style.margin = "5px";

    itemlistInput.style.fontSize = "13px";
    itemlistInput.style.margin = "5px";
    itemlistInput.style.height = "25px";

    addToListBtn.style.marginLeft = "10px";
    addToListBtn.id = "AddBtn";
    addToListBtn.textContent = "Add";
    addToListBtn.onclick = addToList;

    removeListBtn.style.marginLeft = "10px";
    removeListBtn.id = "RemoveBtn";
    removeListBtn.textContent = "Remove";
    removeListBtn.onclick = removeFromList;

    node2.append("Item:");
    node2.appendChild(itemlist);
    node2.appendChild(itemlistInput);

    node2.append("Amount:");

    node2.appendChild(sellingAmount);
    node2.appendChild(addToListBtn);
    node2.appendChild(removeListBtn);
    node2.appendChild(document.createElement("hr"));

    node2.setAttribute(
      "style",
      "position: fixed;z-index: 1000;width: 35%;height: 100%;background-color: #edededd6;visibility:hidden"
    );
    node2.appendChild(productList);
    //node2.appendChild(text);

    node2.appendChild(document.createElement("hr"));
    node2.append("Turn on/off Lumber Mill :");
    node2.appendChild(lumberMillCheckBox);
    node2.appendChild(document.createElement("br"));
    node2.append("Wood to stop :");
    node2.appendChild(WoodStop);

    node2.appendChild(document.createElement("hr"));
    node2.append("Turn on/off Refinery :");
    node2.appendChild(RefineryCheckBox);
    node2.appendChild(document.createElement("br"));
    node2.append("Energy to stop :");
    node2.appendChild(EnergyStop);

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

    node2.append("Clear console :");
    node2.appendChild(ClearConsoleLogCheckBox);
    node2.appendChild(document.createElement("hr"));

    node2.append("Collect Town Coin :");
    node2.appendChild(CollectTownCoinCheckBox);
    node2.appendChild(document.createElement("hr"));

    node2.appendChild(ClearStorageDataBtn);

    node.appendChild(node2);
    node.setAttribute("style", "position:fixed;z-index:1000");
    //text.value = JSON.stringify(craftedItem);
    document.getElementsByTagName("Body")[0].appendChild(node);

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
      var depotObjArray = Object.values(Game.town.objectDict).filter(
        (o) => o.logicType === "Trade"
      );
      var powerPlantArray = Object.values(Game.town.objectDict).filter(
        (o) => o.type === "Power_Plant"
      );
      var lumberMillArray = Object.values(Game.town.objectDict).filter(
        (o) => o.type === "Lumber_Mill"
      );
      var ConstructionSiteArray = Object.values(Game.town.objectDict).filter(
        (o) => o.type === "Construction_Site"
      );
      var isConstructionNeedWood = false;
      var depotObj = "";
      var busyDepotKey = "";
      var depotKey = "";
      var busyDepot = [];
      var i, j;

      if (CollectTownCoinCheckBox.checked) {
        collectTownCoinIfNeedet();
      }

      if (ClearConsoleLogCheckBox.checked) {
        console.clear();
      }

      if (ConstructionSiteArray.length > 0 && AutoCompleteCheckBox.checked) {
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
                  ConstructionSiteArray[i].logicObject.constructionData.reqs
                    .Wood
              ) {
                console.log(ConstructionSiteArray[i].logicObject);
                isConstructionNeedWood = true;
              }
            }
          }
        }
      }

      if (powerPlantArray.length > 0 && RefineryCheckBox.checked) {
        if (Game.town.GetStoredCrafts()["Energy"] >= EnergyStop.value) {
          for (i = 0; i < powerPlantArray.length; i++) {
            if (powerPlantArray[i].logicObject.data.craft == "Energy") {
              powerPlantArray[i].logicObject.SetCraft("None");
            }
          }
          console.log("Turning off Power Plant");
        } else {
          for (i = 0; i < powerPlantArray.length; i++) {
            if (powerPlantArray[i].logicObject.data.craft == "None") {
              powerPlantArray[i].logicObject.SetCraft("Energy");
            }
          }
          console.log("Turning on Power Plant");
        }
      }

      if (lumberMillArray.length > 0 && lumberMillCheckBox.checked) {
        if (
          Game.town.GetStoredCrafts()["Wood"] <= WoodStop.value ||
          Game.town.GetStoredCrafts()["Wood"] == undefined ||
          isConstructionNeedWood
        ) {
          for (i = 0; i < lumberMillArray.length; i++) {
            if (
              lumberMillArray[i].logicObject.data.craft == "Lumber" &&
              lumberMillArray[i].logicObject.data.state != "Produce"
            ) {
              if (lumberMillArray[i].logicObject.data.reqList.Wood > 3) {
                lumberMillArray[i].logicObject.SetCraft("None");
              }
            }
          }
          console.log("Turning off Lumber Mill");
        } else {
          for (i = 0; i < lumberMillArray.length; i++) {
            if (lumberMillArray[i].logicObject.data.craft == "None") {
              lumberMillArray[i].logicObject.SetCraft("Lumber");
            }
          }
          console.log("Turning on Lumber Mill");
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
        var craftedItem = JSON.parse(localStorage.getItem("ItemToSell")) || [];
        for (i = 0; i < craftedItem.length; i++) {
          itemtoSell = craftedItem[i].name;
          nCountItem = craftedItem[i].count;
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
    }, sellTimer * 1000);
  }
})();
