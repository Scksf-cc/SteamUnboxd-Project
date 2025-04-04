const { app } = require('@azure/functions');
// Function to send answers to the Gemini API
async function sendAnswersToGemini() {
    const answers = {};

    // Collect answers from all questions in test.html
    for (let i = 1; i <= 10; i++) {
        const question = document.querySelector(`#prompt${i} p`).textContent;
        const answer = document.getElementById(`answer${i}`).value || 'No answer provided';
        answers[`question${i}`] = { question, answer };
    }

    // Prepare the payload for the Gemini API
    const payload = {
        userId: "12345",
        timestamp: new Date().toISOString(),
        prompt: "Suggest video games that fit with the user's interest based on the answer to these ten questions.",
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
                alert(`Gemini's Suggestions: ${suggestions}`);
            } else {
                alert("Gemini didn't provide any suggestions.");
            }
        } else {
            console.error('Failed to submit answers:', response.statusText);
            if (response.status === 429) {
                alert('You have exceeded your API quota. Please try again later.');
            } else {
                alert('Failed to submit your answers to Gemini. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error submitting answers to Gemini:', error);
        alert('An error occurred while submitting your answers to Gemini. Please try again.');
    }
}

// Attach the sendAnswersToGemini function to the "What Game Should I Play?" button
document.getElementById('whatGameBtn').addEventListener('click', sendAnswersToGemini);
