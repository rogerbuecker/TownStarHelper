//Alle Gebäude von einem Typ steuern
var mines = Object.values(Game.town.objectDict).filter(
  (o) => o.type === "Mine"
);

if (mines.length > 0) {
  for (const mine of mines) {
    mine.logicObject.SetCraft("None");
  }
}

//Straßen updaten
var constructionSitesPavedRoad = Object.values(Game.town.objectDict).filter(
  (o) => o.type === "Construction_Site" && o.data.type === "Paved_Road"
);

var roads = Object.values(Game.town.objectDict).filter(
  (o) => o.type === "Dirt_Road"
);

if (constructionSitesPavedRoad.length <= 0 && roads.length > 0) {
  Game.town.RemoveObject(roads[0].townX, roads[0].townZ, !1);
  Game.town.AddObject("Construction_Site", roads[0].townX, roads[0].townZ, 0, {
    type: "Paved_Road",
  });
  LEDGER.buyObject(roads[0].townX, roads[0].townZ, "Paved_Road", {
    currency:
      Game.objectData["Paved_Road"].BuildCost -
      Game.objectData["Dirt_Road"].DestroyCost,
  });
}

//Lumber Jack updaten
var constructionSitesLogger = Object.values(Game.town.objectDict).filter(
  (o) => o.type === "Construction_Site" && o.data.type === "The_Logger_House"
);

var lumberjacks = Object.values(Game.town.objectDict).filter(
  (o) => o.type === "Lumberjack_House"
);

if (constructionSitesLogger.length <= 0 && lumberjacks.length > 0) {
  Game.town.RemoveObject(lumberjacks[0].townX, lumberjacks[0].townZ, !1);
  Game.town.AddObject(
    "Construction_Site",
    lumberjacks[0].townX,
    lumberjacks[0].townZ,
    0,
    {
      type: "The_Logger_House",
    }
  );
  LEDGER.buyObject(roads[0].townX, roads[0].townZ, "The_Logger_House", {
    currency:
      Game.objectData["The_Logger_House"].BuildCost -
      Game.objectData["Lumberjack_House"].DestroyCost,
  });
}


//bla
Game.town.AddObject("Construction_Site", 10, 50, 0, {
  type: "Steel_Mill",
});

LEDGER.buyObject(10, 50, "Steel_Mill", {
  currency: Game.objectData["Steel_Mill"].BuildCost,
});

Game.addCurrency(10000);
LEDGER.claimDrop(1, {}, 10000);
