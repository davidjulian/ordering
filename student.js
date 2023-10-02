function loadFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            displaySequence(content);
        };
        reader.readAsText(file);
    }
}

function displaySequence(content) {
    const data = JSON.parse(content);
    const sequenceList = document.getElementById('sequenceList'); 

    // Safety checks to ensure data structure
    if (!data) {
        console.error("No data found in the provided content.");
        return;
    }

    // Decode the randomized sequence
    const decodedSequence = JSON.parse(deobfuscateData(data.sequence));

    data.startingElements = data.startingElements || [];
    data.endingElements = data.endingElements || [];

    // Clear existing list
    sequenceList.innerHTML = "";

    // First, add starting elements (if any)
    data.startingElements.forEach(item => {
        sequenceList.innerHTML += `<li class="sequence-item locked-item">${item}</li>`;
    });

    // Add the main sequence items with buttons
    decodedSequence.forEach(item => {
        sequenceList.innerHTML += `
            <li class="sequence-item">
                <div class="button-group">
                    <button onclick="excludeElement(this)">X</button>
                    <button aria-label="Move up" onclick="moveUp(this)">&#9650;</button>
                    <button aria-label="Move down" onclick="moveDown(this)">&#9660;</button>
                </div>
                <span class="sequence-text">${item}</span>
            </li>
        `;
    });

    // Finally, add ending elements (if any)
    data.endingElements.forEach(item => {
        sequenceList.innerHTML += `<li class="sequence-item locked-item">${item}</li>`;
    });
}

function deobfuscateData(obfuscatedData) {
    return decodeURIComponent(atob(obfuscatedData).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function excludeElement(buttonElement) {
    const listItem = buttonElement.closest('.sequence-item');
    
    if (listItem) {
        listItem.classList.toggle('excluded');
    }
}

function moveUp(buttonElement) {
    const sequenceList = document.getElementById('sequenceList');
    const currentItem = buttonElement.closest('.sequence-item');

    if (currentItem && currentItem.previousElementSibling) {
        sequenceList.insertBefore(currentItem, currentItem.previousElementSibling);
    }
}

function moveDown(buttonElement) {
    const sequenceList = document.getElementById('sequenceList');
    const currentItem = buttonElement.closest('.sequence-item');

    if (currentItem && currentItem.nextElementSibling) {
        sequenceList.insertBefore(currentItem.nextElementSibling, currentItem);
    }
}

function saveSequence() {
    const sequenceList = document.getElementById('sequenceList').children;
    const items = [];

    // Iterate over each list item, and collect the sequence
    for (const listItem of sequenceList) {
        if (!listItem.classList.contains('excluded')) {
            const textElement = listItem.querySelector('.sequence-text');
            if (textElement) {
                items.push(textElement.textContent);
            }
        }
    }

    // Convert the sequence to a string format
    const content = JSON.stringify(items);

    // Create a downloadable blob
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, "student_sequence.seq");
}
