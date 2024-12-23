/* Name: Ilsaa Siddiqui, Chidera Uwawake, Sebastian Favela, James Frazier
   Date: 11/12/23
   Beta Checkpoint

   Guide: While hovering over a valid element (indicated by an orange border), press 'Space' and a div will appear
          stating that your request is processing. The text in the div will be replaced when the request is fulfilled.
          To remove the summary, simply press 'Space' again.

          If you want your summary in bullet point format, then press the 'S' key and you can toggle between paragraph
          and list format. You must make this decision BEFORE requesting a summary to see results.
*/

let isBulleted = false;

// Constructs a request payload in the proper formatting
function constructPayload(bulleted, text) {
    return { bulleted: bulleted, text: text }
}

// Summarizes text using our FastAPI which connects our frontend to our backend
// @param: target_text: A string of the text to summarize
// @param: bulleted=false: If the text should be bulleted, true; otherwise, false.
// @return: Summarized text. If bulleted, each bullet starts with a '-'
async function requestSummary(target_text, bulleted=false) {
    const requestPayload = constructPayload(bulleted, target_text);
    const responsePayload = await fetch("http://localhost:8000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });
    const data = await responsePayload.json();
    return data["summary"];
}

// Given a raw, bulleted string from our FastAPI, will turn it into proper html
function processRawContent(rawBulletedText) {
    let content = "<ul>";
    let sliced = rawBulletedText.split('-');
    sliced.shift(); // Removes the first element of the array as it will always be either whitespace or some filler text which ChatGPT threw in
    sliced.forEach(text => {
        content += "<li>" + text + "</li>";
    });
    return content + "</ul>";
}

// Adds an event listener to the document which, upon pressing the equivalent of the 'Space' key, will summarize text
// from some hovered over element. Only one summary can be present at a time.
function spacePresserChecker() {
    // NOTE: The function passed to the event listener is an async function. This is so the function is able to wait
    //       on ChatGPT to process our request. Anytime there is code that depends on an API request or something concurrent
    //       you MUST use the 'await' keyword.
    document.addEventListener('keypress', async function(e) {

        // This functionality is added for beta testing only. We will integrate button choices soon inside the divs
        if (e.code == 'KeyS') {
            isBulleted = !isBulleted;
            console.log("Bulleting the summary: " + isBulleted)
            return;
        }


        if (e.code == 'Space' || e.code == 'Undefined') {
            e.preventDefault();

            let object = $(".highlight"); // Grab any highlighted object. Normally the outside element is the first and most interesting element
            const summaryExists = $('div[id^="mydiv"]').length > 0; // Do we already have a summary up?

            if (summaryExists) {
                $('div[id^="mydiv"]').remove();
            } else if (object.length > 0 && !isBulleted) {
                console.log("Processing Request...");
                // Nielson Norman Heuristics state the user must know what is happening at all times. This is to let the user know to wait a minute.
                object.append($("<div id='mydiv' class='summaryDiv' role='alert'>" + "Requesting summary from ChatGPT. This may take a minute..." + "</div>"));
                const content = await requestSummary(object.text(), isBulleted);
                await $('div[id^="mydiv"]').remove();
                const textDiv = await $("<div id='mydiv' class='summaryDiv' role='alert'>" + content + "</div>");
                await object.append(textDiv);
                await console.log("Request Complete");
            } else if (object.length > 0 && isBulleted) {
                console.log("Processing Request...");
                // Nielson Norman Heuristics state the user must know what is happening at all times. This is to let the user know to wait a minute.
                object.append($("<div id='mydiv' class='summaryDiv' role='alert'>" + "Requesting summary from ChatGPT. This may take a minute..." + "</div>"));
                const rawContent = await requestSummary(object.text(), isBulleted);
                await $('div[id^="mydiv"]').remove();
                const textDiv = await $("<div id='mydiv' class='summaryDiv' role='alert'>" + processRawContent(rawContent) + "</div>");
                await object.append(textDiv);
                await console.log("Request Complete");
            }
        }
    });
}

// old hover function
// Adds hover effect to all appropriate DOM elements
// function addHoverEffect() {
//     $("*:not(body, html)").hover(function() {
//         let object = $(this);
//         object.addClass("highlight");},
//         function() { $(this).removeClass("highlight"); });
// }

// Adds hover effect to all appropriate DOM elements
function addHoverEffect() {
    $("p").hover(function () {
        let object = $(this);
        object.addClass("highlight");
    }, function () {
        $(this).removeClass("highlight");
    });
}


$(document).ready(function() {
    spacePresserChecker(); // Adds event listener ONCE to the document and will check for a space bar press
    addHoverEffect(); // Adds hover event to all appropriate DOM elements


    // THIS IS ALL PREVIOUS CODE BELOW. EVERYTHING WAS TURNED INTO FUNCTIONS ABOVE. NO NEED TO UNCOMMENT.
    // BULLETED CODE FUNCTIONALITY IS BELOW, SO WE CAN COPY AND PASTE INTO A NEW FUNCTION

        // CITE: https://www.w3schools.com/jsref/jsref_split.asp
        // DESCRIPTION: Learned how to parse strings using the split method
        // CITE: https://stackoverflow.com/questions/21870277/what-does-the-this-represent-for-in-javascript
        // DESCRIPTION: Read on how to appropriately direct text content into dom elements to fetch content to be displayed
    //     document.addEventListener('keypress', function(e) {
    //         if (e.shiftKey && e.code === 'KeyL') {
    //             e.preventDefault();
    //             if (!spacePressedsecond && object.hasClass("highlight")) {
    //                 // TRIGGER PARAGRAPH FORMAT ON SHIFT & L KEYS
    //                 let sentences = object.text().split('.');
    //                 let content = "";
    //                 sentences.forEach((sentence) => {
    //                     if (sentence.trim() !== "") {
    //                         content += "<li>" + sentence.trim() + ".</li>";
    //                     }
    //                 });
    //                 let textDiv = $("<div id='mydiv' class= summaryDiv><ul>" + content + "</ul></div>");
    //                 object.append(textDiv);
    //             } else {
    //                 // EXECUTED WHEN SPACE PRESSED A SECOND TIME
    //                 $('div[id^="mydiv"]').remove();
    //             }
    //         }
    //     });
    // }, function() {
    //     $(this).removeClass("highlight");
    // });
});
