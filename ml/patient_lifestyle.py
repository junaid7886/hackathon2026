import pandas as pd

def get_lifestyle_risk():

    # load lifestyle csv
    data = pd.read_csv("patient_lifestyle_data.csv")

    patient = data.iloc[0]

    risk_score = 0

    if patient["bmi"] > 30:
        risk_score += 10

    if patient["smoking"] == 1:
        risk_score += 10

    if patient["alcohol"] == 1:
        risk_score += 5

    if patient["exercise_level"] == 0:
        risk_score += 5

    if patient["sleep_hours"] < 6:
        risk_score += 5

    if patient["diabetes"] == 1:
        risk_score += 15

    if patient["hypertension"] == 1:
        risk_score += 15

    if patient["heart_disease"] == 1:
        risk_score += 20

    if patient["previous_surgeries"] == 1:
        risk_score += 5

    return risk_score
lifestyle_risk = get_lifestyle_risk()
print(lifestyle_risk)