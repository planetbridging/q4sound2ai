class NeuroArchitect {
  constructor() {
    this.architecture = {
      name: "",
      layers: [],
      compile: {},
      preprocessing: [],
      callbacks: [],
    };
  }

  static components = {
    layers: [
      "Dense",
      "Activation",
      "Dropout",
      "Flatten",
      "Reshape",
      "Permute",
      "RepeatVector",
      "Lambda",
      "Conv1D",
      "Conv2D",
      "Conv3D",
      "SeparableConv2D",
      "DepthwiseConv2D",
      "Conv2DTranspose",
      "MaxPooling1D",
      "MaxPooling2D",
      "MaxPooling3D",
      "AveragePooling1D",
      "AveragePooling2D",
      "AveragePooling3D",
      "GlobalMaxPooling1D",
      "GlobalMaxPooling2D",
      "GlobalMaxPooling3D",
      "GlobalAveragePooling1D",
      "GlobalAveragePooling2D",
      "GlobalAveragePooling3D",
      "RNN",
      "LSTM",
      "GRU",
      "SimpleRNN",
      "ConvLSTM2D",
      "Embedding",
      "BatchNormalization",
      "LayerNormalization",
      "InstanceNormalization",
      "Add",
      "Subtract",
      "Multiply",
      "Average",
      "Maximum",
      "Concatenate",
      "Dot",
      "Attention",
      "MultiHeadAttention",
      "UpSampling1D",
      "UpSampling2D",
      "UpSampling3D",
      "ZeroPadding1D",
      "ZeroPadding2D",
      "ZeroPadding3D",
      "Cropping1D",
      "Cropping2D",
      "Cropping3D",
    ],
    activations: [
      "ReLU",
      "Sigmoid",
      "Tanh",
      "Softmax",
      "Softplus",
      "Softsign",
      "Swish",
      "Mish",
      "HardSigmoid",
      "Exponential",
      "Linear",
      "LeakyReLU",
      "PReLU",
      "ELU",
      "SELU",
    ],
    optimizers: [
      "SGD",
      "RMSprop",
      "Adam",
      "Adadelta",
      "Adagrad",
      "Adamax",
      "Nadam",
      "Ftrl",
    ],
    lossFunctions: [
      "MeanSquaredError",
      "MeanAbsoluteError",
      "MeanAbsolutePercentageError",
      "MeanSquaredLogarithmicError",
      "SquaredHinge",
      "Hinge",
      "CategoricalHinge",
      "LogCosh",
      "Huber",
      "CategoricalCrossentropy",
      "SparseCategoricalCrossentropy",
      "BinaryCrossentropy",
      "KullbackLeiblerDivergence",
      "Poisson",
      "CosineProximity",
    ],
    metrics: [
      "Accuracy",
      "BinaryAccuracy",
      "CategoricalAccuracy",
      "SparseCategoricalAccuracy",
      "TopKCategoricalAccuracy",
      "SparseTopKCategoricalAccuracy",
      "MeanSquaredError",
      "MeanAbsoluteError",
      "MeanAbsolutePercentageError",
      "MeanSquaredLogarithmicError",
      "AUC",
      "Precision",
      "Recall",
    ],
    regularizers: ["L1", "L2", "L1L2"],
    constraints: ["MaxNorm", "NonNeg", "UnitNorm", "MinMaxNorm"],
    callbacks: [
      "EarlyStopping",
      "ModelCheckpoint",
      "LearningRateScheduler",
      "ReduceLROnPlateau",
      "CSVLogger",
      "TensorBoard",
      "TerminateOnNaN",
      "ProgbarLogger",
    ],
    dataPreprocessing: [
      "StandardScaler",
      "MinMaxScaler",
      "Normalizer",
      "OneHotEncoder",
      "LabelEncoder",
      "Imputer",
      "PCA",
      "FeatureHasher",
    ],
    utilities: [
      "ModelSavingLoading",
      "TensorManipulation",
      "DataAugmentation",
      "HyperparameterTuning",
    ],
    initializationFunctions: [
      "Zeros",
      "Ones",
      "Constant",
      "RandomNormal",
      "RandomUniform",
      "TruncatedNormal",
      "VarianceScaling",
      "Orthogonal",
      "Identity",
    ],
  };

  static frameworkSupport = new Map([
    ["tensorflowjs", new Map([["Dense", true]])],
    // Add other frameworks and their support here
  ]);

  setName(name) {
    this.architecture.name = name;
  }

  addLayer(type, params) {
    if (NeuroArchitect.components.layers.includes(type)) {
      this.architecture.layers.push({ type, ...params });
    } else {
      throw new Error(`Unsupported layer type: ${type}`);
    }
  }

  setCompileOptions(options) {
    this.architecture.compile = options;
  }

  addPreprocessingStep(type, params) {
    if (NeuroArchitect.components.dataPreprocessing.includes(type)) {
      this.architecture.preprocessing.push({ type, ...params });
    } else {
      throw new Error(`Unsupported preprocessing step: ${type}`);
    }
  }

  addCallback(type, params) {
    if (NeuroArchitect.components.callbacks.includes(type)) {
      this.architecture.callbacks.push({ type, ...params });
    } else {
      throw new Error(`Unsupported callback: ${type}`);
    }
  }

  getArchitecture() {
    return this.architecture;
  }

  static isSupported(componentType, component, framework) {
    return (
      NeuroArchitect.frameworkSupport.has(framework) &&
      NeuroArchitect.frameworkSupport.get(framework).has(component) &&
      NeuroArchitect.frameworkSupport.get(framework).get(component)
    );
  }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = NeuroArchitect;
}
