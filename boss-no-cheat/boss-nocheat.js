const narration = document.querySelector(".blabla")
const strings = ["Snayke! You destroyed all the Urokin! You did it, you have saved the…", "Wait...", "What is that..?", "Oh no, Tenno is awake! Destroying all of his children brought him here to kill you!", "Be careful, Snayke, the faith of Albion is in your hands…"]
let count = 1
narration.innerHTML += strings[0]

window.addEventListener("keydown", e => {
    if (e.key == "Enter") {
        //console.log(strings[count]) 
        if (count < strings.length) {
           //narration.innerHTML = ""
            narration.innerHTML = strings[count]
            count++
        }
        if (count == strings.length) {
            window.location.replace("http://127.0.0.1:5501/boss-stage-no-cheat/boss-stage.html");
        }
    }
});