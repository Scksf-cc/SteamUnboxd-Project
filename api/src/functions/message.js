const { app } = require('@azure/functions');

document.getElementById('whatGameBtn').addEventListener('click', function() {
    getGeminiSuggestion();
});

document.getElementById('suggestAnotherBtn').addEventListener('click', function() {
    getGeminiSuggestion();
});

function getGeminiSuggestion() {
    const summarySection = document.getElementById('summary');
    const loadingOverlay = document.getElementById('loading');
    const geminiResponseSection = document.getElementById('geminiResponse');
    const geminiSuggestions = document.getElementById('geminiSuggestions');

    // Hide the summary section with animation
    summarySection.classList.remove('visible');
    summarySection.classList.add('hidden');

    // Show the loading overlay
    loadingOverlay.style.display = 'flex';
    geminiSuggestions.innerHTML = ''; // Clear previous content

    // Make the Gemini response section visible
    geminiResponseSection.classList.add('visible');

    sendAnswersToGemini()
        .then(appId => {
            // Display Gemini's suggestions in the new section
            if (appId === "No suitable game found." || isNaN(Number(appId))) {
                geminiSuggestions.textContent = appId;
            } else {
                geminiSuggestions.innerHTML = `<iframe src="https://store.steampowered.com/widget/${appId}" width="600" height="300" frameborder="0"></iframe>`;
            }
        })
        .catch(error => {
            console.error("Error during Gemini request:", error);
            geminiSuggestions.textContent = "Failed to get suggestions from Gemini. Please try again.";
        })
        .finally(() => {
            // After Gemini responds (or errors), hide the loading overlay
            loadingOverlay.style.display = 'none';
            summarySection.classList.remove('hidden');
            summarySection.classList.add('visible');
        });
}

async function sendAnswersToGemini() {
    const answers = {};

    // Collect answers from all questions in test.html
    for (let i = 1; i <= 10; i++) {
        const question = document.querySelector(`#prompt${i} p`).textContent;
        const answer = document.getElementById(`answer${i}`).value || 'No answer provided';
        answers[`question${i}`] = { question, answer };
    }

    // Add a random element to the prompt
    const randomNumber = Math.random();

    // Prepare the payload for the Gemini API
    const payload = {
        userId: "12345",
        timestamp: new Date().toISOString(),
        prompt: `Suggest ONE video game that fits the user's interest based on the answer to these ten questions. Consider different possibilities. Random number: ${randomNumber}. ONLY return the Steam App ID of the game. If you cannot find a suitable game, return 'No suitable game found.'`,
        responses: answers,
    };

    // Send the payload to the Gemini API
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=AIzaSyC2SamwlxYOKHLImeNXYDcWqoBCitiDuTk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: payload.prompt + JSON.stringify(payload.responses) }]
                }]
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Submission successful:', result);

            // Extract and display the suggested video games to the user
            if (result.candidates && result.candidates.length > 0) {
                const suggestions = result.candidates[0].content.parts[0].text;
                return suggestions;
            } else {
                return "No suitable game found.";
            }
        } else {
            console.error('Failed to submit answers:', response.statusText);
            if (response.status === 429) {
                alert('You have exceeded your API quota. Please try again later.');
            } else {
                alert('Failed to submit your answers to Gemini. Please try again.');
            }
            throw new Error('Failed to get suggestions from Gemini.');
        }
    } catch (error) {
        console.error('Error submitting answers to Gemini:', error);
        alert('An error occurred while submitting your answers to Gemini. Please try again.');
        throw error;
    }
}
