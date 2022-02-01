// ==UserScript==
// @name         DESIGN DEV
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  DEV
// @author       Roger
// @match        https://townstar.sandbox-games.com/*
// @match        file:///C:/Roger/develop/*
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  let configOpen = false;

  attachConfigGui();

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

  function closeAllScreens() {
    for (const element of document.getElementsByClassName("close-button")) {
      element.click();
    }
  }

  function attachConfigGui() {
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
      const option = document.createElement("DIV");
      const itemInfo = "Gasolin 500pt 300$";
      option.innerText = "Gasolin";
      option.title = itemInfo;
      option.setAttribute("data-key", "Gasolin");
      allItemsList.appendChild(option);
      /*       for (var key in Game.craftData) {
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

    activeItemsList.setAttribute(
      "style",
      "width: 45%;float: left;height: 100%;position: relative;overflow-y: auto;border: 5px dotted green;padding: 1%;"
    );
    activeItemsList.id = "activeItemsList";

    if (localStorage.getItem("activeItemsList")) {
      activeItemsList.innerHTML = localStorage.getItem("activeItemsList");
    }

    var strong = document.createElement("STRONG");
    var autosellText = document.createTextNode("Autosell:");
    strong.appendChild(autosellText);

    //bothItemsList.append(strong);
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
      const option = document.createElement("DIV");
      const itemInfo = "Iteminfo";
      option.innerText = "AutoSell";
      option.title = itemInfo;
      option.setAttribute("data-key", "AutoSell");
      allItemsList.appendChild(option);
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
      activeBuildingsList.innerHTML = localStorage.getItem(
        "activeBuildingsList"
      );
    }

    var strong2 = document.createElement("STRONG");
    var buildingText = document.createTextNode("Toggle Buildings:");

    strong2.appendChild(buildingText);

    //bothBuildingsList.append(strong2);
    bothBuildingsList.append(allBuildingsList);
    bothBuildingsList.append(activeBuildingsList);

    configDiv.id = "configDiv";
    configDiv.setAttribute(
      "style",
      "position: fixed;z-index: 1000; left: 25%; top: 10%; width: 50%; height: 70%; background-color: rgb(163, 207, 65); opacity: 0.65; visibility:hidden; padding: 10px; color: green;"
    );

    configDiv.append(strong);
    configDiv.append(bothItemsList);

    configDiv.append(strong2);
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
})();
