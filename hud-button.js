const hud = document.querySelector("body > div:nth-child(29) > div > div.bottom");
const helperButtonDiv = document.createElement("div");
const buttonImage = document.createElement("img");

helperButtonDiv.style ="position: fixed; bottom: 5px; right: 15px;";

buttonImage.src = "https://tutuapp-vip.com/wp-content/uploads/2021/06/panda-helper-app-200px-144x144.png";
buttonImage.width = 100;
buttonImage.height = 100;

helperButtonDiv.appendChild(buttonImage);
hud.appendChild(helperButtonDiv);
