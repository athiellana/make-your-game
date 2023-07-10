const narration = document.querySelector(".blabla")
const strings = ["Snayke! You destroyed all the Urokin! You did it, you have saved the…", "Wait...", "Snayke, no… What have you done?!", "I told you not to use Netra-171! You're going to die! I did warned you! This is the most stupid decision that you could make!"]
let count = 1
narration.innerHTML += strings[0]

window.addEventListener("keydown", e => {
    if (e.key == "Enter") {
        //console.log(strings[count]) 
        if (count < strings.length) {
           //narration.innerHTML = ""
            narration.innerHTML = strings[count]
            count++
        } else {
            window.location.href = window.location.href.replace("index-cheatON.html", "index-cheatON-pt2.html")
        }
    }
});