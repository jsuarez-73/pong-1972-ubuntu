import tensorflow as tf

model = tf.keras.models.load_model("./src_py/model/agent_two.keras")
model.save("./src_py/model/agent_two.h5")
