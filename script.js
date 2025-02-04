
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

let animated_text;
function start(){
    animated_text = new AnimatedText("#container", "Hello World");
}

window.onload = start;

class AnimatedText {

    constructor (container, text = ""){
        this.container = document.querySelector(container);
        this.text = text;

        this.init();
    }

    async set(new_text){
        let result = this.minEdit(new_text);
        result = result.reverse();

        for(let i = 0; i < result.length; i++){

            const element = result[i];

            if(element[0] == this.INSERT){
                this.addLetter(element[1], element[2]);
            } else if(element[0] == this.DELETE){
                this.removeLetter(this.container.children[element[2] - 1]);
            } else if(element[0] == this.REPLACE){
                this.changeLetter(this.container.children[element[2] - 1], element[1]);
            }

            await sleep(Math.random() * 50);
        }

        this.text = new_text;
    }

    async init() {
        let arr = this.text.split('');
        for(let i = 0; i < arr.length; i++){
            await sleep(100);
            this.addLetter(arr[i]);
        }
    }

    addLetter(letter, idx = -1){

        if (idx < 0){
            idx = this.container.children.length;
        }

        if(letter == ' '){
            letter = '\xa0';
        }

        let elm = document.createElement('span')
        elm.appendChild(document.createTextNode(letter))
        elm.setAttribute("data-char", letter);
        elm.setAttribute("data-char-after", letter);
        elm.classList.add("animated-letter");
        elm.classList.add("fade-in");
        elm.style.width = 0;
        requestAnimationFrame(()=>{
            elm.style.width = window.getComputedStyle(elm,':before').width;
        });

        elm.addEventListener("animationend", ()=>{
            elm.classList.remove("fade-in");
        });

        if(idx > this.container.children.length - 1){
            this.container.appendChild(elm);
        } else {
            this.container.insertBefore(elm, this.container.children[idx]);
        }

        return elm;
    }

    removeLetter(elm){
        elm.classList.add("fade-out");
        elm.style.width = 0;
        elm.addEventListener("animationend", ()=>{
            elm.remove();
        });
    }

    changeLetter(elm, letter){

        if(letter == ' '){
            letter = '\xa0';
        }

        elm.classList.add("fade-in-out");
        elm.setAttribute("data-char-after", letter);
        elm.innerHTML = letter;
        requestAnimationFrame(()=>{
            elm.style.width = window.getComputedStyle(elm,':before').width;
        });
        elm.addEventListener("animationend", () => {
            elm.classList.remove("fade-in-out");
            elm.setAttribute("data-char", letter);
        });
    }

    INSERT = 0;
    DELETE = 1;
    REPLACE = 2;

    minDisRec(from_str, to_str, from_idx, to_idx, memo) {
        if (from_idx === 0) return Array.from(to_str.slice(0, to_idx), (char) => [this.INSERT, char, 0]);

        if (to_idx === 0) return Array.from(from_str.slice(0, from_idx), (char, idx) => [this.DELETE, char, from_idx - idx]);

        if (memo[from_idx][to_idx].length != 0){
            let ret = memo[from_idx][to_idx];
            return ret;
        }

        if (from_str[from_idx - 1] == to_str[to_idx - 1]) {
            memo[from_idx][to_idx] = this.minDisRec(from_str, to_str, from_idx - 1, to_idx - 1, memo);
        } else {

            let insert = this.minDisRec(from_str, to_str, from_idx, to_idx - 1, memo);    // Insert
            let remove = this.minDisRec(from_str, to_str, from_idx - 1, to_idx, memo);    // Remove
            let replace = this.minDisRec(from_str, to_str, from_idx - 1, to_idx - 1, memo); // Replace

            if(insert.length < remove.length && insert.length < replace.length){
                let newInsert = insert.slice();
                newInsert.push([this.INSERT, to_str[to_idx - 1], from_idx]);
                memo[from_idx][to_idx] = newInsert;
            } else if(remove.length < insert.length && remove.length < replace.length){
                let newRemove = remove.slice();
                newRemove.push([this.DELETE, from_str[from_idx - 1], from_idx]);
                memo[from_idx][to_idx] = newRemove;
            } else {
                let newReplace = replace.slice();
                newReplace.push([this.REPLACE, to_str[to_idx - 1], from_idx]);
                memo[from_idx][to_idx] = newReplace;
            }
        }

        return memo[from_idx][to_idx]; // Return the computed minimum distance
    }

    minEdit(to_str){
        const from_idx = this.text.length;
        const to_idx = to_str.length;

        let memo = Array.from({ length: from_idx + 1 }, () => Array.from({ length: to_idx + 1 }, () => []));

        let result = this.minDisRec(this.text, to_str, from_idx, to_idx, memo);

        return result;
    }

}