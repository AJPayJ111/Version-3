import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

print("--- Setting up Data ---")
# 1. Define input data (Features must be in a 2D format for scikit-learn)
# Let's say: X = Hours a software automation runs per day 
X = np.array([[1], [2], [3], [4], [5], [6]])

# 2. Define output data (Labels/Targets)
# Let's say: y = Number of data entries processed automatically
y = np.array([10, 22, 31, 39, 52, 60])

print(f"Inputs (X) :\n{X}")
print(f"Outputs (y): {y}\n")
    
print("--- Training the Model ---")
#3. Initialize the simplest built-in model
model = LinearRegression()

#4. Fit (train) the model on our data
model.fit(X, y)
print("Model training complete!\n")

print("--- Making a prediction ---")
# 5. Predict the outcome for a new value (e.g., if the bot runs for 7 hours)
new_hours = np.array([[7]])
prediction = model.predict(new_hours)

print(f"If the automation bot runs for 7 hours...")
print(f" Predicted data entries processed: {prediction[0]:.2f}\n")

print("--- Plotting Results ---")
# 6. Generate predictions for the training line plot
y_pred = model.predict(X)

# 7. Create the visualization
plt.figure(figsize=(8, 5))
plt.scatter(X, y, color='blue', label='Actual Data')
plt.plot(X, y_pred, color='red', linewidth=2, label='Regression Line')
plt.scatter(new_hours, prediction, color='green', marker='*', s=200, label='Prediction (7 hrs)')

# 8. Add labels and styling
plt.title('Automation Runtime vs Entries Processed')
plt.xlabel('Hours Run Per Day')
plt.ylabel('Data Entries Processed')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.6)

# 9. Display the plot
plt.savefig('prediction_plot.png')