import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

# Load dataset
train = pd.read_csv(r"C:\Users\sikindarbasha\Documents\hakathon\Training.csv")
test = pd.read_csv(r"C:\Users\sikindarbasha\Documents\hakathon\Testing.csv")

# Remove extra column if present
if "Unnamed: 133" in train.columns:
    train = train.drop(columns=["Unnamed: 133"])

if "Unnamed: 133" in test.columns:
    test = test.drop(columns=["Unnamed: 133"])

# Split features and labels
X_train = train.drop("prognosis", axis=1)
y_train = train["prognosis"]

X_test = test.drop("prognosis", axis=1)
y_test = test["prognosis"]

# Encode disease labels
encoder = LabelEncoder()
y_train = encoder.fit_transform(y_train)
y_test = encoder.transform(y_test)

# Train model
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

model.fit(X_train, y_train)

# Predict disease
predictions = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, predictions)

print("Model Accuracy:", accuracy)

# Example prediction
sample = X_test.iloc[[3]]

predicted = model.predict(sample)[0]
disease = encoder.inverse_transform([predicted])[0]


# Disease risk scores based on severity, urgency, and complication risk

disease_risk_scores = {

    "Fungal infection": 20,
    "Allergy": 25,
    "GERD": 40,
    "Chronic cholestasis": 60,
    "Drug Reaction": 65,
    "Peptic ulcer diseae": 55,
    "AIDS": 90,
    "Diabetes": 70,
    "Gastroenteritis": 50,
    "Bronchial Asthma": 65,
    "Hypertension": 70,
    "Migraine": 40,
    "Cervical spondylosis": 45,
    "Paralysis (brain hemorrhage)": 95,
    "Jaundice": 70,
    "Malaria": 75,
    "Chicken pox": 60,
    "Dengue": 85,
    "Typhoid": 80,
    "Hepatitis A": 75,
    "Hepatitis B": 90,
    "Hepatitis C": 90,
    "Hepatitis D": 92,
    "Hepatitis E": 80,
    "Alcoholic hepatitis": 85,
    "Tuberculosis": 90,
    "Common Cold": 20,
    "Pneumonia": 85,
    "Dimorphic hemmorhoids(piles)": 50,
    "Heart attack": 100,
    "Varicose veins": 55,
    "Hypothyroidism": 60,
    "Hyperthyroidism": 65,
    "Hypoglycemia": 75,
    "Osteoarthristis": 60,
    "Arthritis": 65,
    "(vertigo) Paroymsal Positional Vertigo": 55,
    "Acne": 20,
    "Urinary tract infection": 60,
    "Psoriasis": 50,
    "Impetigo": 35
}
def get_disease_risk(disease_name):
    risk_score = disease_risk_scores.get(disease_name, "Unknown")
    return disease_name, risk_score

risk_score = get_disease_risk(disease)

print("Disease:", disease)
print("Risk Score:", risk_score)
