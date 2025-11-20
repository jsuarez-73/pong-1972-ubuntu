import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("runs/train_log.csv")
df_subset = df.iloc[::1]
plt.figure(figsize=(10,6))
#plt.plot(df["t_elapsed_s"]/3600, df["hits_counter"])
hits_counter = df_subset["hits_counter"] 
avg_hits = []
hit_cum = 0
h_counter = 0
for hit in hits_counter:
    h_counter += 1
    hit_cum += hit
    avg_hits.append((hit_cum / h_counter) * 5)
cum_avg_counter = df_subset["cumulativeRewardAverage_two"] 
avg_cum = []
avg_cum_cum = 0
cum_counter = 0
for avg in cum_avg_counter:
    cum_counter += 1
    avg_cum_cum += avg
    avg_cum.append((avg_cum_cum / cum_counter) * 20)
plt.plot(df_subset["episodes"], hits_counter)
plt.plot(df_subset["episodes"], avg_hits)
plt.plot(df_subset["episodes"], df_subset["cumulativeRewardAverage_two"] * 10)
plt.plot(df_subset["episodes"], avg_cum)
plt.plot(df_subset["episodes"], df_subset["epsilon_two"] * 50)
#plt.plot(df_subset["episodes"], df_subset["cumulativeRewardAgent"])
#plt.plot(df["episodes"], df["frame_ag_two"])
plt.xlabel("Training Time (hours)")
plt.ylabel("Average Cumulative Reward")
plt.title("DQN Pong Training Progress (M1 GPU)")
plt.grid(True)
plt.show()
