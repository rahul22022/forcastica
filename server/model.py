# model.py

import seaborn as sns
import matplotlib.pyplot as plt
import os

# In-memory data storage
current_df = {
    "data": None
}


def analyze_data(df):
    sns.set(style="whitegrid")
    fig, ax = plt.subplots(figsize=(10, 6))

    numeric_cols = df.select_dtypes(include='number').columns
    if len(numeric_cols) > 0:
        sns.histplot(df[numeric_cols[0]], kde=True, ax=ax)
        ax.set_title(f'Distribution of {numeric_cols[0]}')

    output_path = os.path.join("uploads", "analysis.png")
    plt.savefig(output_path)
    plt.close()
    return output_path
