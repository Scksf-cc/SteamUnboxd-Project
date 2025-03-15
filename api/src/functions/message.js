const { app } = require('@azure/functions');

app.http('message', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json();
    const { age, height, weight, bloodPressure, familyDiseases } = body;

    // Calculate BMI
    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

    // Calculate points for age
    let agePoints = 0;
    if (age < 30) agePoints = 0;
    else if (age < 45) agePoints = 10;
    else if (age < 60) agePoints = 20;
    else agePoints = 30;

    // Calculate points for BMI
    let bmiPoints = 0;
    if (bmi >= 18.5 && bmi <= 24.9) bmiPoints = 0;
    else if (bmi >= 25 && bmi <= 29.9) bmiPoints = 30;
    else bmiPoints = 75;

    // Calculate points for blood pressure
    let bloodPressurePoints = 0;
    switch (bloodPressure) {
      case 'normal': bloodPressurePoints = 0; break;
      case 'elevated': bloodPressurePoints = 15; break;
      case 'stage1': bloodPressurePoints = 30; break;
      case 'stage2': bloodPressurePoints = 75; break;
      case 'crisis': bloodPressurePoints = 100; break;
    }

    // Calculate points for family diseases
    const familyDiseasePoints = familyDiseases.length * 10;

    // Calculate total score
    const totalScore = agePoints + bmiPoints + bloodPressurePoints + familyDiseasePoints;

    // Determine risk category
    let riskCategory = '';
    if (totalScore <= 20) riskCategory = 'Low Risk';
    else if (totalScore <= 50) riskCategory = 'Moderate Risk';
    else if (totalScore <= 75) riskCategory = 'High Risk';
    else riskCategory = 'Uninsurable';

    // Return all calculations and results
    return {
      body: JSON.stringify({
        bmi,
        agePoints,
        bmiPoints,
        bloodPressurePoints,
        familyDiseasePoints,
        score: totalScore,
        category: riskCategory,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  },
});