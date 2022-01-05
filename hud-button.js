var hud = document.querySelector("body > div:nth-child(29) > div > div.bottom");
var helperButton = document.createElement("div");
var buttonImage = document.createElement("img");

helperButton.className = "right hud-helper-button";
helperButton.style ="pointer-events: all; visibility: visible; bottom: 135px;";

buttonImage.src = "https://www.schmengler-se.de/wp-content/uploads/2016/09/helper.png";
buttonImage.width = "58px";
buttonImage.height = "58px";
helperButton.appendChild(buttonImage);
hud.appendChild(helperButton);

