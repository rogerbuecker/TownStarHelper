// ==UserScript==
// @name         Town Star Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Town Star Helper
// @author       Roger - Modify from exisiting scripts from  Groove
// @match        https://townstar.sandbox-games.com/launch/
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const refreshIntervall = 5; // Seconds
  let configAttached = false;
  let configOpen = false;
  let craftedItem = [];
  let trackedItems = [];

  //add event listener key s
  document
    .getElementById("application-canvas")
    .addEventListener("keydown", function (event) {
      if (event.key === "s") {
        toggleConfig();
      }
    });

  //Load Monitor
  LoadProductionMonitor();

  window.myHelperTimer = setInterval(function () {
    checkWork();
  }, refreshIntervall * 1000);

  function checkWork() {
    if (typeof Game != "undefined" && Game.town != null && !configAttached) {
      //add config gui
      attachConfigGui();
      configAttached = true;
    }

    //check airdrop collected
    if (
      document.getElementsByClassName("hud-airdrop-button")[0] &&
      document.getElementsByClassName("hud-airdrop-button")[0].style.display !=
        "none"
    ) {
      document.getElementsByClassName("hud-airdrop-button")[0].click();
      document
        .getElementsByClassName("air-drop")[0]
        .getElementsByClassName("yes")[0]
        .click();
    }

    //check playnow button
    if (
      document.getElementById("playnow-container") &&
      document.getElementById("playnow-container").style.visibility !== "hidden"
    ) {
      document.getElementById("playButton").click();
    }

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

    collectTownCoinIfNeedet();
  }

  function attachConfigGui() {
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

    var node = document.createElement("DIV");
    var Loadbtn = document.createElement("BUTTON");
    var node2 = document.createElement("DIV");
    var Savebtn = document.createElement("BUTTON");
    var ClearStorageDataBtn = document.createElement("BUTTON");
    var text = document.createElement("TEXTAREA");
    var lumberMillCheckBox = document.createElement("Input");
    var RefineryCheckBox = document.createElement("Input");
    var AutoCompleteCheckBox = document.createElement("Input");
    var LaborCost = document.createElement("Input");
    var WoodStop = document.createElement("Input");
    var EnergyStop = document.createElement("Input");
    var ClearConsoleLogCheckBox = document.createElement("Input");
    var CollectTownCoinCheckBox = document.createElement("Input");

    var StartSellingCheckBox = document.createElement("Input");
    Loadbtn.setAttribute("id", "configBtn");
    Loadbtn.textContent = "Open";
    Loadbtn.onclick = LoadConfig;

    Savebtn.setAttribute("id", "Savebtn");
    Savebtn.textContent = "Close config";
    Savebtn.onclick = CloseConfig;

    ClearStorageDataBtn.setAttribute("style", "margin-left:10px;");
    ClearStorageDataBtn.setAttribute("id", "ClearDataBtn");
    ClearStorageDataBtn.textContent = "Clear Storage Data";
    ClearStorageDataBtn.onclick = ClearData;

    text.setAttribute("readonly", "true");
    text.setAttribute("id", "configTxt");
    text.setAttribute("style", "height:100px;width:380px;");
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

    node.appendChild(Loadbtn);
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
    node2.appendChild(text);

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

    node2.appendChild(Savebtn);
    node2.appendChild(ClearStorageDataBtn);

    node.appendChild(node2);
    node.setAttribute("style", "position:fixed;z-index:1000");
    text.value = JSON.stringify(craftedItem);
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
  }

  function toggleConfig() {
    if (configOpen) {
      document.getElementById("ConfigDiv").style.display = "none";
      document.getElementById("ConfigDiv").style.visibility = "hidden";
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
    var itemListArray = JSON.parse(document.getElementById("configTxt").value);
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
    var name = document.getElementById("ListOfAllItemInput").value;
    if (count < 10) {
      count = 10;
    }
    itemListArray.push({ name: name, count: count });
    document.getElementById("configTxt").value = JSON.stringify(itemListArray);
  }

  function removeFromList() {
    var itemListArray = JSON.parse(document.getElementById("configTxt").value);
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
    document.getElementById("configTxt").value = JSON.stringify(itemListArray);
  }

  function LoadConfig() {
    document.getElementById("ConfigDiv").style.visibility = "visible";
    //To close all fullscreens
    for (
      var i = 0;
      i < document.getElementsByClassName("close-button").length;
      i++
    ) {
      document.getElementsByClassName("close-button")[i].click();
    }
  }

  function CloseConfig() {
    document.getElementById("ConfigDiv").style.visibility = "hidden";
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
    localStorage.setItem(
      "ItemToSell",
      document.getElementById("configTxt").value
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
})();
