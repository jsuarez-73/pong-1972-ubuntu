import tensorflow as tf

class Dqn:
    @staticmethod
    def ft_createDeepQNetwork(h: int, w: int, num_actions: int) -> tf.keras.Sequential:
        if h < 0 or w < 0 or num_actions < 1:
            raise ValueError(f"h:{h}, w:{w}, num_actions:{num_actions} invalid")
        model = tf.keras.Sequential([
            tf.keras.layers.Conv2D(128, 3, strides=1, activation='relu', input_shape=(h, w, 3)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Conv2D(256, 3, strides=1, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Conv2D(256, 3, strides=1, activation='relu'),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(100, activation='relu'),
            tf.keras.layers.Dropout(0.25),
            tf.keras.layers.Dense(num_actions)
        ])
        return model

    @staticmethod
    def ft_copyWeights(destNetwork: tf.keras.Model, srcNetwork: tf.keras.Model) -> None:
        original = destNetwork.trainable
        if destNetwork.trainable != srcNetwork.trainable:
            destNetwork.trainable = srcNetwork.trainable
        destNetwork.set_weights(srcNetwork.get_weights())
        destNetwork.trainable = original
