const narration = document.querySelector(".blabla")
const strings = ["HAHAHAHA! You idiot little human…", "You really thought that it was that easy to get rid off us?", "It was a trap… Using Netra-171 only increased my power! I'm now INVINCIBLE!", "YOU WILL DIE HUMANS! HAHAHAHA!"]
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
            window.location.replace("http://127.0.0.1:5501/boss-stage-cheat/boss-stage-cheat.html");
        }
    }
});