import * as Tf from "@tensorflow/tfjs-node";

export	class	Dqn {
	public static ft_createDeepQNetwork(h: number, w: number, numActions: number): Tf.Sequential {
		if (h < 0 || w < 0 || numActions < 1) {
			throw new Error(`h: ${h}, w: ${w}, or numActions: ${numActions} is wrong.`);
		}
		const model = Tf.sequential();
		model.add(Tf.layers.conv2d({
			filters: 128,
			kernelSize: 3,
			strides: 1,
			activation: 'relu',
			inputShape: [h, w, 3]
		}));
		model.add(Tf.layers.batchNormalization());
		model.add(Tf.layers.conv2d({
			filters: 256,
			kernelSize: 3,
			strides: 1,
			activation: 'relu'
		}));
		model.add(Tf.layers.batchNormalization());
		model.add(Tf.layers.conv2d({
			filters: 256,
			kernelSize: 3,
			strides: 1,
			activation: 'relu'
		}));
		model.add(Tf.layers.flatten());
		model.add(Tf.layers.dense({units: 100, activation: 'relu'}));
		model.add(Tf.layers.dropout({rate: 0.25}));
		model.add(Tf.layers.dense({units: numActions}));
		return model;
	}

	public	static ft_copyWeights(destNetwork: Tf.Sequential, srcNetwork: Tf.Sequential): void {
		let originalDestNetworkTrainable;
		if (destNetwork.trainable !== srcNetwork.trainable) {
			originalDestNetworkTrainable = destNetwork.trainable;
			destNetwork.trainable = srcNetwork.trainable;
		}
		destNetwork.setWeights(srcNetwork.getWeights());
		if (originalDestNetworkTrainable != null) {
			destNetwork.trainable = originalDestNetworkTrainable;
		}
	}
}
