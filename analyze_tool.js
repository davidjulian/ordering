// ** This app compares the element order in a test sequence to the element order in a reference sequence.
// ** The first analysis algorithm focuses on matching adjacent pairs of elements in the test and reference sequences:
// ** 1) If an adjacent pair is in the reference sequence, add 1 point.
// ** 2) If an adjacent pair is reversed from the reference sequence, do not add or subtract points.
// ** 3) If an adjacent pair is not in the reference sequence and is not reversed, subtract 1 point. 
// ** 4) Calculate the maximum number of points that can be earned. This is (seg.length - 1) points.
// ** 5) Add the maximum number of points to the number of points earned and divide by 2 times the maximum number of points.
// ** 6) Multiply by 100 to get a percentage of correctness.
// ** The second analysis uses Spearman's Rho to determine the correlation between the test and reference sequences:
// ** 1) Rank the elements in the reference and test sequences from 1 to n.
// ** 2) Calculate Spearman's Rho. If the sequences are of unequal length, Spearman's Rho cannot be calculated.
// ** 3) Adjust Spearman's Rho to a scale of 0 to 100.
// ** The app then reports the following scores:
// ** 1) Points: The number of points earned by the adjacent pair algorithm.
// ** 2) Adjacent Pair Correctness: The percentage of points earned out of the maximum number of points possible.
// ** 3) Spearman's Rho: The correlation between the test and reference sequences.
// ** 4) Geometric Mean Score: The geometric mean of the adjacent pair correctness and Spearman's Rho.
// ** 5) Harmonic Mean Score: The harmonic mean of the adjacent pair correctness and Spearman's Rho.
// ** 6) Min-Max Normalized Score: The min-max normalized score of the adjacent pair correctness and Spearman's Rho.
// ** The app then prompts for a new test sequence and repeats the analysis.

let allResults = [];

// Global variable to store the root name of the reference file
let referenceFileNameRoot = '';

function analyzeSequence(referenceData, sequence) {
    let reference = referenceData.sequence;
    const startingElements = referenceData.startingElements;
    const endingElements = referenceData.endingElements;
    const distractors = referenceData.distractors;

    let points = 0;

    // Before starting the analysis, remove the fixed elements from the reference and sequence arrays
    reference = reference.filter(item => !startingElements.includes(item) && !endingElements.includes(item));
    sequence = sequence.filter(item => !startingElements.includes(item) && !endingElements.includes(item));

    // Take an array of numbers and return an array of pairs, where each pair is made up of two adjacent elements in the original array.
    const extractPairs = (seq) => {
        let pairs = [];
        for (let i = 0; i < seq.length - 1; i++) {
            pairs.push(seq[i] + seq[i + 1]);
        }
        return pairs;
    };
    
    function getRanks(sequence) {
        const sorted = [...sequence].sort((a, b) => a.localeCompare(b));
        return sequence.map(element => sorted.indexOf(element) + 1);
    }
    
    function calculateSpearman(reference, test) {
        if (reference.length !== test.length) {
            return NaN;  // or return '-1', or whatever value you choose
        }const referenceRanks = getRanks(reference);
        const testRanks = getRanks(test);
    
        const n = reference.length;
    
        // Calculate squared differences between ranks
        const squaredDifferences = referenceRanks.map((rank, i) => {
            const difference = rank - testRanks[i];
            return difference * difference;
        });
    
        // Sum of squared differences
        const sumOfSquaredDifferences = squaredDifferences.reduce((a, b) => a + b, 0);
    
        // Calculate rho
        const rho = 1 - (6 * sumOfSquaredDifferences) / (n * (Math.pow(n, 2) - 1));
        return rho.toFixed(2);  // Return result rounded to 2 decimal places
    }

    const referencePairs = extractPairs(reference);
    console.log('Reference Pairs:', referencePairs);
    
    const testPairs = extractPairs(sequence);
    console.log('Test Pairs:', testPairs);

    for (let pair of testPairs) {
        // Check if the current pair is included in the "referencePairs" array
        console.log('Evaluating Pair:', pair);

        if (referencePairs.includes(pair)) {
            // If it is, increment the "points" variable
            console.log('Pair Correct');
            points++;
        } else {
            // If it's not, check if the reversed pair is included in the "referencePairs" array
            let reversedPair = pair[1] + pair[0];
            if (referencePairs.includes(reversedPair)) {
                // If it is, do not add or subtract points
                console.log('Pair Reversed');
                points += 0;
            } else {
                // If it's not, subtract 1 from the "points" variable
                console.log('Pair Incorrect');
                points--;
            }
        }
    }        
 
    const maxPoints = reference.length - 1; 
    const correctness = (points + maxPoints) / (2 * maxPoints) * 100;
    const spearmanRho = calculateSpearman(reference, sequence);
    
    const maxCorrectness = 100;  // Correctness as a percentage
    const maxSpearman = 1;  // Spearman's Rho ranges from -1 to 1

    // Adjusting Spearman's rho to a scale of 0 to 100
    const adjustedSpearmanRho = (parseFloat(spearmanRho) + 1) / 2;
    const adjustedSpearmanPercentage = adjustedSpearmanRho * 100;

    // Calculating combined scores
    const geometricMeanFraction = Math.sqrt((correctness / 100) * adjustedSpearmanRho);
    const geometricMean = geometricMeanFraction * 100;
    const harmonicMean = (2 * correctness * adjustedSpearmanPercentage) / (correctness + adjustedSpearmanPercentage);
    const minMaxNormalized = (correctness + adjustedSpearmanPercentage) / 2;

    // Return results at the end
    return {
        points: points,
        correctness: correctness.toFixed(2),
        spearmanRho: spearmanRho,
        geometricMean: geometricMean.toFixed(2),
        harmonicMean: harmonicMean.toFixed(2),
        minMaxNormalized: minMaxNormalized.toFixed(2)
    };
}

function processFiles() {
    const referenceFile = document.getElementById('reference-file').files[0];
    const sequenceFiles = document.getElementById('sequence-files').files;

    if (!referenceFile || sequenceFiles.length === 0) {
        alert('Please select the reference and student files before processing.');
        return;
    }

    // Extract and store the root name of the reference file
    referenceFileNameRoot = referenceFile.name.split('_')[0];

    referenceFile.text().then(referenceContent => {
        const referenceData = JSON.parse(referenceContent);

        for (let i = 0; i < sequenceFiles.length; i++) {
            sequenceFiles[i].text().then(sequenceContent => {
                const sequence = JSON.parse(sequenceContent);
                const result = analyzeSequence(referenceData, sequence);
    
                // Begin the merged display logic:
                console.log(`Results for ${sequenceFiles[i].name}:`);
                console.log(`Points: ${result.points}`);
                console.log(`Adjacent Pair Correctness: ${result.correctness}%`);
                if (isNaN(result.spearmanRho)) {
                    console.log("Spearman's Rho cannot be computed for sequences of unequal lengths.");
                } else {
                    console.log(`Spearman's Rho: ${result.spearmanRho}`);
                    console.log(`Geometric Mean Score: ${result.geometricMean}%`);
                    console.log(`Harmonic Mean Score: ${result.harmonicMean}%`);
                    console.log(`Min-Max Normalized Score: ${result.minMaxNormalized}%`);
                }
                console.log('----------------------------');
    
                // Display in the UI:
                const resultList = document.getElementById("results-list");
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Results for ${sequenceFiles[i].name}:</strong><br>
                    Points: ${result.points}<br>
                    Adjacent Pair Correctness: ${result.correctness}%<br>
                    ${isNaN(result.spearmanRho) 
                        ? "Spearman's Rho cannot be computed for sequences of unequal lengths."
                        : `
                            Spearman's Rho: ${result.spearmanRho}<br>
                            Geometric Mean Score: ${result.geometricMean}%<br>
                            Harmonic Mean Score: ${result.harmonicMean}%<br>
                            Min-Max Normalized Score: ${result.minMaxNormalized}%
                        `
                    }
                `;
                resultList.appendChild(listItem);
                allResults.push({
                    filename: sequenceFiles[i].name,
                    points: result.points,
                    correctness: result.correctness,
                    spearmanRho: isNaN(result.spearmanRho) ? "N/A" : result.spearmanRho,
                    geometricMean: result.geometricMean,
                    harmonicMean: result.harmonicMean,
                    minMaxNormalized: result.minMaxNormalized
                });
            });
        }
    });
}

function convertToCSV(objArray) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // Headers
    for (let index in objArray[0]) {
        if (str !== '') str += ',';
        str += '"' + index + '"';
    }
    str += '\r\n';

    // Data
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line !== '') line += ',';
            
            let value = array[i][index];
            if (typeof value === 'string' && value.includes(',')) { // Escaping values with commas
                value = '"' + value + '"';
            }
            line += value;
        }
        str += line + '\r\n';
    }
    return str;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

function saveResultsAsCSV() {
    if (allResults.length === 0) {
        alert('No results to save!');
        return;
    }
    
    const csvString = convertToCSV(allResults);

    // Use the stored root name from the reference file for the results filename
    const resultsFileName = referenceFileNameRoot + '_results.csv';
    downloadCSV(csvString, resultsFileName);
}

