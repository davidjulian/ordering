let sequence = [];
let distractors = [];
let startingElements = [];
let endingElements = [];

function handleStartingElementsInput(input) {
    startingElements = input.split('\n').filter(line => line.trim() !== "");
}

function handleEndingElementsInput(input) {
    endingElements = input.split('\n').filter(line => line.trim() !== "");
}

function handleSequenceInput(input) {
    sequence = input.split('\n').filter(line => line.trim() !== "");
}

function handleDistractorInput(input) {
    distractors = input.split('\n').filter(line => line.trim() !== "");
}

function generateRandomizedSequence() {
    return sequence.concat(distractors).sort(() => Math.random() - 0.5);
}

function obfuscateData(data) {
    return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function saveFiles() {
    // Prompt for a base filename
    const baseFilename = prompt("Enter a base filename:", "filename");
    if (!baseFilename) {
        alert("No filename entered. Operation cancelled.");
        return;
    }

    const zip = new JSZip();
    const randomizedSequence = generateRandomizedSequence();

    const referenceData = {
        startingElements: startingElements,
        sequence: sequence,
        endingElements: endingElements,
        distractors: distractors,
        numberOfDistractors: distractors.length
    };

    const combinedData = {
        startingElements: startingElements,
        sequence: obfuscateData(JSON.stringify(randomizedSequence)),
        endingElements: endingElements,
        numberOfDistractors: distractors.length
    };

    zip.file(`${baseFilename}_reference.seq`, JSON.stringify(referenceData));
    zip.file(`${baseFilename}_self-check.seq`, JSON.stringify(combinedData));
    zip.file(`${baseFilename}_assessment.seq`, JSON.stringify(combinedData));

    zip.generateAsync({ type: "blob" }).then(content => {
        saveAs(content, `${baseFilename}_sequences.zip`);
    });
}

function openFile() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.seq';
    fileInput.onchange = function(event) {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function(readerEvent) {
                let content = readerEvent.target.result;
                populateUI(JSON.parse(content));
                reader.onerror = function(error) {
                    console.log('Error reading file:', error);
                };
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
}

function populateUI(data) {
    const startingElementsArea = document.getElementById('startingElementsInput');
    const sequenceArea = document.getElementById('sequenceInput');
    const endingElementsArea = document.getElementById('endingElementsInput');
    const distractorsArea = document.getElementById('distractorsInput');

    // Update the UI
    startingElementsArea.value = data.startingElements.join('\n');
    sequenceArea.value = data.sequence.join('\n');
    endingElementsArea.value = data.endingElements.join('\n');
    distractorsArea.value = data.distractors.join('\n');

    // Update the global variables
    startingElements = data.startingElements;
    sequence = data.sequence;
    endingElements = data.endingElements;
    distractors = data.distractors;
}
