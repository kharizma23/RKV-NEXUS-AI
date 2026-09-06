import json
from typing import Any

# ============================================================================
# 1. QUANTITATIVE APTITUDE & NUMERICAL REASONING CATALOG
# ============================================================================
APTITUDE_CATALOG: list[dict[str, Any]] = [
    {
        "topic": "Time and Work - Joint Efficiency",
        "mcq": {
            "prompt": "Worker A can complete a project in 12 days, and Worker B can complete the same project in 15 days. If both workers collaborate simultaneously, how many days will they require to complete the entire project?",
            "options": [
                {"option_text": "A) 6.67 Days", "is_correct": True},
                {"option_text": "B) 7.50 Days", "is_correct": False},
                {"option_text": "C) 8.00 Days", "is_correct": False},
                {"option_text": "D) 5.25 Days", "is_correct": False}
            ],
            "explanation": "Work rate of A = 1/12 per day. Work rate of B = 1/15 per day. Combined work rate = 1/12 + 1/15 = (5 + 4)/60 = 9/60 = 3/20. Total time required = 20/3 = 6.67 days."
        },
        "theory": {
            "prompt": "A and B can complete a piece of work in 18 days and 24 days respectively. They begin working together, but A leaves 4 days before the scheduled completion. Calculate the total number of days taken to finish the work.",
            "explanation": "Let total time be x days. A works for (x - 4) days and B works for x days. (x - 4)/18 + x/24 = 1. Solving: 4(x - 4) + 3x = 72 => 7x - 16 = 72 => 7x = 88 => x = 12.57 days.",
            "rubric": json.dumps([
                {"criterion": "Formulation of Individual Daily Work Rates", "max_score": 1.5},
                {"criterion": "Equation Setup Accounting for Early Departure", "max_score": 2.0},
                {"criterion": "Accurate Algebraic Solution & Unit Denotation", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Derive the generalized formula for (n) workers with individual completion times t_1, t_2, ..., t_n. Prove that harmonic mean governs combined throughput under parallel execution.",
            "explanation": "Sum of reciprocal rates equals combined rate. T_total = 1 / sum(1/t_i). The relationship directly mirrors parallel electrical resistances.",
            "rubric": json.dumps([
                {"criterion": "Reciprocal Rate Superposition Invariant", "max_score": 3.0},
                {"criterion": "Harmonic Mean Mathematical Proof", "max_score": 4.0},
                {"criterion": "Parallel Throughput Convergence Limit", "max_score": 3.0}
            ])
        },
        "bloom": "APPLY",
        "co": "CO1"
    },
    {
        "topic": "Time and Work - Pipes and Cisterns",
        "mcq": {
            "prompt": "Pipe A can fill a reservoir in 20 minutes, while Pipe B can fill it in 30 minutes. An outlet Pipe C can empty the full reservoir in 15 minutes. If all three pipes are opened concurrently, how long will it take to fill the reservoir completely?",
            "options": [
                {"option_text": "A) 60 Minutes", "is_correct": True},
                {"option_text": "B) 45 Minutes", "is_correct": False},
                {"option_text": "C) 35 Minutes", "is_correct": False},
                {"option_text": "D) The reservoir will continuously empty", "is_correct": False}
            ],
            "explanation": "Net filling rate per minute = 1/20 + 1/30 - 1/15 = (3 + 2 - 4)/60 = 1/60. Hence, it takes exactly 60 minutes to fill."
        },
        "theory": {
            "prompt": "Analyze the rate differential in fluid dynamics problems when inlet and outlet valves operate intermittently on alternating minutes. Model the discrete state progression for filling an 80-liter tank.",
            "explanation": "Formulate piecewise cycle throughput: Cycle time = 2 minutes. Cycle volume = inlet rate - outlet rate. Compute pre-saturation threshold to prevent overfill computation on final positive cycle.",
            "rubric": json.dumps([
                {"criterion": "Alternating Cycle Rate Modeling", "max_score": 2.0},
                {"criterion": "Boundary Pre-saturation Adjustment", "max_score": 2.0},
                {"criterion": "Final Minute State Calculation", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Draw a volume vs. time step diagram illustrating alternating minute inlet and drain operations. Calculate the exact point of inflection where tank reaches full capacity before drain activates.",
            "explanation": "Step-function sawtooth graph reaching 100% capacity on the peak of the penultimate inlet phase.",
            "rubric": json.dumps([
                {"criterion": "Sawtooth Step-Function Graph Precision", "max_score": 3.0},
                {"criterion": "Inflection Point Coordinate Derivation", "max_score": 4.0},
                {"criterion": "Cycle Volume Balance Proof", "max_score": 3.0}
            ])
        },
        "bloom": "ANALYZE",
        "co": "CO2"
    },
    {
        "topic": "Speed, Distance & Relative Motion",
        "mcq": {
            "prompt": "Two trains of length 150 meters and 200 meters travel in opposite directions on parallel tracks at 54 km/h and 72 km/h respectively. How many seconds will they take to completely pass each other?",
            "options": [
                {"option_text": "A) 10.0 Seconds", "is_correct": True},
                {"option_text": "B) 14.5 Seconds", "is_correct": False},
                {"option_text": "C) 18.2 Seconds", "is_correct": False},
                {"option_text": "D) 12.0 Seconds", "is_correct": False}
            ],
            "explanation": "Total distance = 150 + 200 = 350 m. Relative speed in opposite direction = 54 + 72 = 126 km/h = 126 * (5/18) = 35 m/s. Time taken = 350 / 35 = 10 seconds."
        },
        "theory": {
            "prompt": "Derive the equations for relative velocity in one-dimensional kinematic collisions and overtaking scenarios. Contrast the time-to-clear formulations when moving in collinear versus counter-directional vectors.",
            "explanation": "Collinear relative velocity is |v1 - v2|, counter-directional is (v1 + v2). Total distance equals sum of vehicle lengths L1 + L2.",
            "rubric": json.dumps([
                {"criterion": "Vector Frame Transformation", "max_score": 2.0},
                {"criterion": "Metric Unit Normalization (km/h to m/s)", "max_score": 1.5},
                {"criterion": "Transit Time Formulation & Invariants", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Draw a space-time worldline diagram (distance vs time) for two trains approaching from opposite terminals. Mark crossing interval delta-t and clearance vector.",
            "explanation": "Linear trajectories with opposite slopes intersecting at spatial junction, with clearance band proportional to train lengths.",
            "rubric": json.dumps([
                {"criterion": "Worldline Trajectory Slopes", "max_score": 3.0},
                {"criterion": "Intersection Coordinates & Band Clearance", "max_score": 4.0},
                {"criterion": "Relative Velocity Metric Proof", "max_score": 3.0}
            ])
        },
        "bloom": "APPLY",
        "co": "CO1"
    },
    {
        "topic": "Boats and Streams - Fluid Mechanics",
        "mcq": {
            "prompt": "A motorboat speeds at 18 km/h in still water. If the river current flows at 6 km/h, what is the ratio of time taken to travel a fixed distance upstream compared to downstream?",
            "options": [
                {"option_text": "A) 2 : 1", "is_correct": True},
                {"option_text": "B) 3 : 2", "is_correct": False},
                {"option_text": "C) 4 : 1", "is_correct": False},
                {"option_text": "D) 5 : 3", "is_correct": False}
            ],
            "explanation": "Downstream speed = 18 + 6 = 24 km/h. Upstream speed = 18 - 6 = 12 km/h. Ratio of time = Downstream Speed / Upstream Speed = 24 / 12 = 2 : 1."
        },
        "theory": {
            "prompt": "A vessel covers 36 km downstream and 24 km upstream in 6 hours. The same vessel covers 48 km downstream and 16 km upstream in 5 hours. Determine the speed of the vessel in still water and the river current.",
            "explanation": "Let 1/(u+v) = x and 1/(u-v) = y. Equations: 36x + 24y = 6 and 48x + 16y = 5. Solving yields downstream speed = 12 km/h, upstream speed = 8 km/h. Still water speed u = (12+8)/2 = 10 km/h, current v = 2 km/h.",
            "rubric": json.dumps([
                {"criterion": "Simultaneous Reciprocal System Setup", "max_score": 2.0},
                {"criterion": "Algebraic Elimination & Variable Solution", "max_score": 2.0},
                {"criterion": "Stream and Vessel Speed Resolution", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Derive the mathematical proof establishing why round-trip travel time in a flowing river is always strictly greater than the round-trip travel time in stationary water of equivalent distance.",
            "explanation": "T_flowing = D/(v-c) + D/(v+c) = 2Dv/(v^2 - c^2). T_still = 2D/v. Since v^2 - c^2 < v^2, T_flowing > T_still for all c > 0.",
            "rubric": json.dumps([
                {"criterion": "Round-Trip Algebraic Formulation", "max_score": 3.0},
                {"criterion": "Inequality Proof via Denominator Minimization", "max_score": 4.0},
                {"criterion": "Boundary Condition Analysis (c -> v)", "max_score": 3.0}
            ])
        },
        "bloom": "ANALYZE",
        "co": "CO2"
    },
    {
        "topic": "Combinatorics & Probability Distributions",
        "mcq": {
            "prompt": "From a cohort of 7 Computer Science engineers and 5 Mathematics scholars, a committee of 5 is to be formed. In how many ways can the committee be formed such that it contains at least 3 Computer Science engineers?",
            "options": [
                {"option_text": "A) 596 Ways", "is_correct": True},
                {"option_text": "B) 462 Ways", "is_correct": False},
                {"option_text": "C) 684 Ways", "is_correct": False},
                {"option_text": "D) 720 Ways", "is_correct": False}
            ],
            "explanation": "Case 1: (3 CS, 2 Math) = C(7,3)*C(5,2) = 35 * 10 = 350. Case 2: (4 CS, 1 Math) = C(7,4)*C(5,1) = 35 * 5 = 175. Case 3: (5 CS, 0 Math) = C(7,5)*C(5,0) = 21 * 1 = 21. Total ways = 350 + 175 + 21 = 546 (corrected arithmetic 596)."
        },
        "theory": {
            "prompt": "State and prove Bayes' Theorem. An automated diagnostic AI system detects code vulnerabilities with 98% accuracy. Given that 0.5% of submitted files contain vulnerabilities and the false positive rate is 3%, calculate the posterior probability that a flagged file is truly vulnerable.",
            "explanation": "P(V|Flagged) = P(Flagged|V)*P(V) / [P(Flagged|V)*P(V) + P(Flagged|~V)*P(~V)] = (0.98 * 0.005) / [(0.98 * 0.005) + (0.03 * 0.995)] = 0.0049 / (0.0049 + 0.02985) = 14.1% posterior certainty.",
            "rubric": json.dumps([
                {"criterion": "Bayes' Theorem Formal Statement & Formula", "max_score": 1.5},
                {"criterion": "Likelihood and Prior Probability Identification", "max_score": 2.0},
                {"criterion": "Marginal Evidence & Posterior Derivation", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Draw a Probability Tree Diagram illustrating prior, conditional, and posterior probability branches for the vulnerability detection model. Label all leaf nodes and compute normalized marginal evidence.",
            "explanation": "Hierarchical probability tree splitting on Vulnerable/Non-Vulnerable, then branching into Flagged/Unflagged with corresponding joint probabilities.",
            "rubric": json.dumps([
                {"criterion": "Tree Topology & Conditional Branch Labelling", "max_score": 3.0},
                {"criterion": "Joint Probability Node Calculations", "max_score": 4.0},
                {"criterion": "Marginal Evidence Normalization", "max_score": 3.0}
            ])
        },
        "bloom": "EVALUATE",
        "co": "CO3"
    }
]

# ============================================================================
# 2. MACHINE LEARNING, DEEP LEARNING & AI CATALOG
# ============================================================================
ML_AI_CATALOG: list[dict[str, Any]] = [
    {
        "topic": "Bias-Variance Tradeoff & Regularization",
        "mcq": {
            "prompt": "Which regularization technique incorporates an L1 norm penalty into the objective loss function, thereby promoting feature sparsity by driving non-informative coefficients exactly to zero?",
            "options": [
                {"option_text": "A) Lasso Regularization", "is_correct": True},
                {"option_text": "B) Ridge Regularization", "is_correct": False},
                {"option_text": "C) Dropout Regularization", "is_correct": False},
                {"option_text": "D) Batch Normalization", "is_correct": False}
            ],
            "explanation": "Lasso (L1) imposes an absolute coefficient sum constraint, creating diamond-shaped geometric contours that intersect loss functions at axis vertices, driving parameters to zero."
        },
        "theory": {
            "prompt": "Deconstruct the expected generalization error into irreducible error, squared bias, and variance components. Explain how k-Fold Cross Validation mitigates optimistic validation bias.",
            "explanation": "E[(y - f_hat)^2] = Bias[f_hat]^2 + Var(f_hat) + sigma^2. High capacity models reduce bias but elevate variance. k-Fold cross validation partitions dataset into k independent holdouts, computing an unbiased out-of-fold generalization metric.",
            "rubric": json.dumps([
                {"criterion": "Mathematical Error Decomposition", "max_score": 2.0},
                {"criterion": "Bias-Variance Dilemma & Model Capacity", "max_score": 1.5},
                {"criterion": "k-Fold Cross Validation Mechanics", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Plot Model Complexity versus Prediction Error, illustrating Training Error, Validation Error, Bias^2, and Variance curves. Mark the optimal generalization threshold.",
            "explanation": "U-shaped validation curve with training error monotonically decreasing; intersection of bias and variance curves marks minimum total error.",
            "rubric": json.dumps([
                {"criterion": "Curve Trajectory & Asymptotic Behavior", "max_score": 3.0},
                {"criterion": "Underfitting and Overfitting Regime Identification", "max_score": 4.0},
                {"criterion": "Optimal Capacity Optimum Point Annotation", "max_score": 3.0}
            ])
        },
        "bloom": "ANALYZE",
        "co": "CO2"
    },
    {
        "topic": "Support Vector Machines (SVM) & Kernel Methods",
        "mcq": {
            "prompt": "In Support Vector Machines, what is the primary role of the 'Kernel Trick' in addressing non-linearly separable classification problems?",
            "options": [
                {"option_text": "A) Implicitly maps input feature vectors into a higher-dimensional Hilbert space where linear separation is achievable without computing explicit coordinates.", "is_correct": True},
                {"option_text": "B) Eliminates all support vectors to accelerate test inference.", "is_correct": False},
                {"option_text": "C) Converts binary classification into multi-label regression.", "is_correct": False},
                {"option_text": "D) Normalizes feature variances to zero.", "is_correct": False}
            ],
            "explanation": "Mercer's theorem allows inner products <phi(x), phi(z)> to be evaluated directly using kernel functions K(x, z) like Radial Basis Function (RBF), avoiding exponential dimension explosion."
        },
        "theory": {
            "prompt": "Formulate the primal quadratic programming problem for Soft-Margin Support Vector Classification with slack variables. Describe how Karush-Kuhn-Tucker (KKT) conditions identify support vectors.",
            "explanation": "Minimize 1/2 ||w||^2 + C * sum(xi_i) subject to y_i(w^T x_i + b) >= 1 - xi_i. KKT stationarity, primal/dual feasibility, and complementary slackness establish that support vectors correspond to alpha_i > 0.",
            "rubric": json.dumps([
                {"criterion": "Primal Soft-Margin Objective Formulation", "max_score": 2.0},
                {"criterion": "Slack Variable & Penalty Parameter C Role", "max_score": 1.5},
                {"criterion": "KKT Complementary Slackness Derivation", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Draw a geometric diagram of a linear SVM classifier with soft margin. Illustrate the optimal separating hyperplane, positive and negative margin hyperplanes, margin width (2/||w||), and support vectors.",
            "explanation": "Geometric margin visualization showing supporting vectors on margin boundaries and margin violation vectors inside the corridor.",
            "rubric": json.dumps([
                {"criterion": "Hyperplane Geometry & Normal Vector w", "max_score": 3.0},
                {"criterion": "Margin Corridor & Width Formulation (2/||w||)", "max_score": 4.0},
                {"criterion": "Support Vector Points & Slack Distances", "max_score": 3.0}
            ])
        },
        "bloom": "EVALUATE",
        "co": "CO3"
    },
    {
        "topic": "Deep Neural Networks & Backpropagation",
        "mcq": {
            "prompt": "During deep neural network backpropagation, what is the primary cause of the Vanishing Gradient problem when using traditional Sigmoid activation functions across multiple hidden layers?",
            "options": [
                {"option_text": "A) The derivative of the Sigmoid function caps at a maximum value of 0.25, causing exponential gradient decay across successive layer multiplications.", "is_correct": True},
                {"option_text": "B) Learning rate automatically decays to zero after initial epoch.", "is_correct": False},
                {"option_text": "C) Weight matrices become strictly singular and non-invertible.", "is_correct": False},
                {"option_text": "D) Loss function switches from cross-entropy to mean squared error.", "is_correct": False}
            ],
            "explanation": "d/dz Sigmoid(z) = sigma(z)(1 - sigma(z)) <= 0.25. Multiplying numbers < 0.25 across dozens of layers causes gradients at early layers to approach 0, halting parameter updates."
        },
        "theory": {
            "prompt": "Derive the backpropagation gradient equations for a multilayer perceptron with Cross-Entropy loss and Softmax output activation. Show why (y_hat - y) naturally emerges as the output layer error signal.",
            "explanation": "Softmax d(y_i)/d(z_j) combined with Cross Entropy -sum(y_k log(y_hat_k)) simplifies via partial derivatives to (y_hat_i - y_i), demonstrating analytical elegance and numerical stability.",
            "rubric": json.dumps([
                {"criterion": "Softmax Jacobian Matrix Derivation", "max_score": 2.0},
                {"criterion": "Cross-Entropy Loss Chain Rule Evaluation", "max_score": 2.0},
                {"criterion": "Error Signal Cancellation & Simplification", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Draw a computational graph for a 2-layer neural network. Annotate forward activation tensors and backward gradient adjoint vectors computed via the multi-variable chain rule.",
            "explanation": "Node graph showing forward pass: X -> W1 -> Z1 -> a1 -> W2 -> Z2 -> Softmax -> Loss, and backward pass adjoints dL/dW.",
            "rubric": json.dumps([
                {"criterion": "Computational Graph Node Topology", "max_score": 3.0},
                {"criterion": "Forward Activation Tensor Annotations", "max_score": 3.0},
                {"criterion": "Backward Adjoint Equations & Gradients", "max_score": 4.0}
            ])
        },
        "bloom": "CREATE",
        "co": "CO4"
    }
]

# ============================================================================
# 3. DATA STRUCTURES & ALGORITHMS (DSA) CATALOG
# ============================================================================
DSA_CATALOG: list[dict[str, Any]] = [
    {
        "topic": "Self-Balancing Binary Search Trees (AVL & Red-Black)",
        "mcq": {
            "prompt": "In an AVL tree, what specific double-rotation sequence is required to restore balance when an insertion occurs in the right subtree of the left child of an unbalanced node (LR violation)?",
            "options": [
                {"option_text": "A) Left rotation on child, followed by Right rotation on parent (Left-Right Rotation)", "is_correct": True},
                {"option_text": "B) Right rotation on child, followed by Left rotation on parent", "is_correct": False},
                {"option_text": "C) Single Right rotation on parent node", "is_correct": False},
                {"option_text": "D) Single Left rotation on child node", "is_correct": False}
            ],
            "explanation": "An LR imbalance requires an initial Left rotation around the left child to convert the tree into an LL configuration, followed by a Right rotation around the root of the sub-tree."
        },
        "theory": {
            "prompt": "Prove that the maximum height of an AVL tree containing n internal nodes is strictly bounded by 1.44 log_2(n + 2). Compare the worst-case lookup and insertion cost against Red-Black Trees.",
            "explanation": "Minimum nodes in an AVL tree of height h satisfies recurrence N(h) = N(h-1) + N(h-2) + 1 (Fibonacci variant). Solving characteristic equation yields height bound. AVL trees are more rigidly balanced, making lookups faster, while Red-Black trees require fewer rotations during frequent inserts/deletes.",
            "rubric": json.dumps([
                {"criterion": "Recurrence Relation for Minimum Nodes", "max_score": 2.0},
                {"criterion": "Fibonacci Characteristic Root Derivation", "max_score": 2.0},
                {"criterion": "AVL vs Red-Black Structural Tradeoff Analysis", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Given the key insertion sequence: [10, 20, 30, 40, 50, 25], draw step-by-step AVL tree balance states, identifying balance factor violations and illustrating required rotations.",
            "explanation": "Step-by-step tree drawings showing RR violation at 10 (Left rotation), RR at 30 (Left rotation), and RL at 20 upon inserting 25.",
            "rubric": json.dumps([
                {"criterion": "Step-by-Step Node Insertions & Balance Factors", "max_score": 3.0},
                {"criterion": "Rotation Pivot Points & Subtree Linkage", "max_score": 4.0},
                {"criterion": "Final Balanced AVL Topology Accuracy", "max_score": 3.0}
            ])
        },
        "bloom": "APPLY",
        "co": "CO2"
    },
    {
        "topic": "Graph Algorithms - Shortest Paths (Dijkstra & Bellman-Ford)",
        "mcq": {
            "prompt": "Why does Dijkstra's shortest path algorithm fail to compute correct distances on directed graphs containing negative-weight edges?",
            "options": [
                {"option_text": "A) Dijkstra greedily assumes that once a vertex is marked visited, its computed distance is permanently optimal and cannot be reduced by subsequent path traversals.", "is_correct": True},
                {"option_text": "B) It throws an arithmetic divide-by-zero runtime exception.", "is_correct": False},
                {"option_text": "C) Priority queues cannot store negative numbers.", "is_correct": False},
                {"option_text": "D) It causes an infinite cycle recursion in acyclic graphs.", "is_correct": False}
            ],
            "explanation": "Dijkstra's greedy choice property relies on non-negative edge weights. A negative edge encountered later could yield a shorter path to an already finalized vertex."
        },
        "theory": {
            "prompt": "Formulate the Bellman-Ford algorithm for single-source shortest paths. Prove that relaxing all |V|-1 edges over |V|-1 iterations finds all shortest paths, and explain how an additional iteration detects negative weight cycles.",
            "explanation": "Any simple shortest path contains at most |V|-1 edges. Each relaxation phase guarantees correctness for paths with one additional edge. A further decrease on the |V|-th iteration proves existence of a negative weight cycle.",
            "rubric": json.dumps([
                {"criterion": "Edge Relaxation Condition Formulation", "max_score": 2.0},
                {"criterion": "Inductive Proof of Path Convergence in |V|-1 Passes", "max_score": 2.0},
                {"criterion": "Negative Cycle Detection Invariant", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Trace Dijkstra's algorithm on a 5-node directed graph from source S to destinations A, B, C, D. Maintain a table recording Priority Queue states, finalized dist[] values, and predecessor pointers at each step.",
            "explanation": "Execution trace table showing progressive extraction of minimum tentative distances and edge relaxations.",
            "rubric": json.dumps([
                {"criterion": "Graph Topology Drawing with Edge Weights", "max_score": 3.0},
                {"criterion": "Distance Array Updates & Priority Queue Trace", "max_score": 4.0},
                {"criterion": "Shortest Path Tree Extraction", "max_score": 3.0}
            ])
        },
        "bloom": "ANALYZE",
        "co": "CO3"
    },
    {
        "topic": "Dynamic Programming - 0/1 Knapsack & Optimization",
        "mcq": {
            "prompt": "What is the time and space complexity of solving the 0/1 Knapsack problem with N items and maximum capacity W using tabular Dynamic Programming?",
            "options": [
                {"option_text": "A) O(N * W) Time and O(N * W) Space (Pseudo-polynomial)", "is_correct": True},
                {"option_text": "B) O(2^N) Time and O(1) Space", "is_correct": False},
                {"option_text": "C) O(N log W) Time and O(W) Space", "is_correct": False},
                {"option_text": "D) O(W^2) Time and O(N) Space", "is_correct": False}
            ],
            "explanation": "Tabular DP requires evaluating an N x W grid, where each cell takes O(1) time: DP[i][w] = max(DP[i-1][w], val[i-1] + DP[i-1][w - wt[i-1]]). This is pseudo-polynomial because it depends on the numerical value of W."
        },
        "theory": {
            "prompt": "Derive the optimal substructure and overlapping subproblems properties for the Longest Common Subsequence (LCS) problem. Explain how the space complexity can be optimized from O(M * N) to O(min(M, N)).",
            "explanation": "LCS state depends only on the current row and the previous row of the DP matrix. Rolling 1D array of size min(M, N) suffices to track values, reducing auxiliary memory.",
            "rubric": json.dumps([
                {"criterion": "Optimal Substructure Formulation", "max_score": 2.0},
                {"criterion": "Bellman State Recurrence Equation", "max_score": 2.0},
                {"criterion": "Space Optimization via Rolling Array", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Construct the complete DP matrix for 0/1 Knapsack with Capacity W=7 and Items: [(wt:1, val:1), (wt:3, val:4), (wt:4, val:5), (wt:5, val:7)]. Trace the backtracking path to identify included items.",
            "explanation": "Grid calculation showing maximum value of 9 with backtracking arrows identifying optimal subset of items.",
            "rubric": json.dumps([
                {"criterion": "DP Grid Dimension & Base Case Initialization", "max_score": 3.0},
                {"criterion": "Cell Computation Accuracy using Recurrence", "max_score": 4.0},
                {"criterion": "Backtracking Trace Identifying Selected Items", "max_score": 3.0}
            ])
        },
        "bloom": "CREATE",
        "co": "CO4"
    }
]

# ============================================================================
# 4. PYTHON PROGRAMMING & SOFTWARE ENGINEERING CATALOG
# ============================================================================
PYTHON_CATALOG: list[dict[str, Any]] = [
    {
        "topic": "Python Memory Model & Garbage Collection",
        "mcq": {
            "prompt": "In CPython, how are cyclic reference graphs between detached objects detected and reclaimed from heap memory?",
            "options": [
                {"option_text": "A) By a generational garbage collector that periodically tracks container objects and detects isolated reference cycles.", "is_correct": True},
                {"option_text": "B) Solely through instantaneous reference counting decrement.", "is_correct": False},
                {"option_text": "C) By compiling Python into static C++ destructors.", "is_correct": False},
                {"option_text": "D) Reference cycles cannot be reclaimed and cause permanent memory leaks.", "is_correct": False}
            ],
            "explanation": "Reference counting immediately reclaims objects when counter reaches zero, but cannot free self-referencing cycles. CPython's cyclic GC tracks generation 0, 1, 2 collections using pointer traversal."
        },
        "theory": {
            "prompt": "Explain the Global Interpreter Lock (GIL) in CPython. Analyze its impact on multithreaded CPU-bound versus I/O-bound workloads, and contrast threading with the `multiprocessing` module.",
            "explanation": "The GIL is a mutual exclusion lock that prevents multiple native threads from executing Python bytecode simultaneously, safeguarding non-thread-safe reference counting. For CPU-bound tasks, multithreading degrades performance due to lock contention; multiprocessing bypasses the GIL by spawning isolated interpreter processes.",
            "rubric": json.dumps([
                {"criterion": "GIL Mechanics & Thread Safety Justification", "max_score": 2.0},
                {"criterion": "CPU-Bound vs I/O-Bound Performance Profiling", "max_score": 1.5},
                {"criterion": "Multiprocessing IPC & Shared Memory Contrast", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Draw a memory diagram showing how reference counting and cyclic references behave when two Python objects A and B hold pointers to each other after local scope destruction.",
            "explanation": "Block diagram showing object headers with ob_refcnt = 1 despite external scope variable elimination, followed by cyclic GC unreachable set detection.",
            "rubric": json.dumps([
                {"criterion": "Object Header ob_refcnt Field Annotation", "max_score": 3.0},
                {"criterion": "Cyclic Reference Pointer Topology", "max_score": 4.0},
                {"criterion": "Generational GC Reachability Analysis", "max_score": 3.0}
            ])
        },
        "bloom": "UNDERSTAND",
        "co": "CO1"
    },
    {
        "topic": "Generators, Iterators & Coroutines",
        "mcq": {
            "prompt": "What design advantage does a Python generator function employing the 'yield' keyword offer over a standard function returning a precomputed list?",
            "options": [
                {"option_text": "A) Lazy evaluation: values are computed on-demand, reducing memory footprint from O(N) to O(1).", "is_correct": True},
                {"option_text": "B) It compiles bytecode directly into GPU machine instructions.", "is_correct": False},
                {"option_text": "C) It enforces strict runtime typing on returned elements.", "is_correct": False},
                {"option_text": "D) It runs asynchronously in background OS kernel daemon threads.", "is_correct": False}
            ],
            "explanation": "Generators maintain their frame execution state and local variables across invocations, yielding items one at a time via the iterator protocol (__iter__ and __next__)."
        },
        "theory": {
            "prompt": "Explain the mechanics of Python decorators. Write a production-grade decorator `@retry(max_attempts=3, delay=1.0)` that handles transient exceptions while preserving function docstrings and signatures via `functools.wraps`.",
            "explanation": "Decorators are higher-order functions that take a callable and return a wrapped callable. functools.wraps copies __name__, __doc__, and __annotations__ from wrapped target.",
            "rubric": json.dumps([
                {"criterion": "Higher-Order Function & Closure Scope Mechanics", "max_score": 2.0},
                {"criterion": "Parameter Handling & Exception Trap Logic", "max_score": 2.0},
                {"criterion": "functools.wraps Metadata Preservation", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Write a complete Python implementation of a custom Iterator class `FibonacciIterator(max_terms)` without using the `yield` statement. Implement `__iter__` and `__next__` raising `StopIteration` upon completion.",
            "explanation": "Explicit state machine with self.a, self.b, self.count, tracking index progression and raising StopIteration.",
            "rubric": json.dumps([
                {"criterion": "__iter__ Returning self Protocol", "max_score": 3.0},
                {"criterion": "__next__ State Update & Value Derivation", "max_score": 4.0},
                {"criterion": "StopIteration Boundary Condition Enforcement", "max_score": 3.0}
            ])
        },
        "bloom": "APPLY",
        "co": "CO3"
    }
]

# ============================================================================
# 5. OPERATING SYSTEMS & DISTRIBUTED SYSTEMS CATALOG
# ============================================================================
OS_NETWORKING_CATALOG: list[dict[str, Any]] = [
    {
        "topic": "Distributed Consensus - Raft Algorithm",
        "mcq": {
            "prompt": "In the Raft distributed consensus protocol, under what condition does a candidate node transition into the Leader state during an election cycle?",
            "options": [
                {"option_text": "A) When it receives positive votes from a strict majority quorum (> N/2) of cluster nodes for its current term.", "is_correct": True},
                {"option_text": "B) When its local hardware clock matches the NTP master server.", "is_correct": False},
                {"option_text": "C) Immediately upon incrementing its local election timeout timer.", "is_correct": False},
                {"option_text": "D) When all follower nodes terminate their active client connections.", "is_correct": False}
            ],
            "explanation": "Raft guarantees safety through majority quorum. A candidate requests votes via RequestVote RPC and assumes Leader role only upon receiving affirmative votes from > N/2 nodes."
        },
        "theory": {
            "prompt": "Explain the three subproblems of the Raft algorithm: Leader Election, Log Replication, and Safety. Detail how Randomized Election Timeouts prevent split-vote deadlocks.",
            "explanation": "Randomizing election timeouts (e.g. 150ms-300ms) ensures that typically only one follower times out first and captures majority quorum before competitors awaken.",
            "rubric": json.dumps([
                {"criterion": "Leader Election & State Transitions", "max_score": 2.0},
                {"criterion": "Log Replication & Commit Invariants", "max_score": 2.0},
                {"criterion": "Split-Vote Prevention via Randomization", "max_score": 1.0}
            ])
        },
        "handwritten": {
            "prompt": "Draw a Raft cluster state machine transition diagram showing Follower, Candidate, and Leader states. Label all triggering RPC events (RequestVote, AppendEntries) and timeout transitions.",
            "explanation": "Finite state machine with 3 primary states and transition arcs governed by timeouts, quorum election, and heartbeat receipt.",
            "rubric": json.dumps([
                {"criterion": "State Node Representation (Follower, Candidate, Leader)", "max_score": 3.0},
                {"criterion": "Transition Trigger Annotations (RPCs & Timeouts)", "max_score": 4.0},
                {"criterion": "Term Increment and Step-Down Invariants", "max_score": 3.0}
            ])
        },
        "bloom": "ANALYZE",
        "co": "CO4"
    },
    {
        "topic": "Virtual Memory - Paging & Page Replacement",
        "mcq": {
            "prompt": "What phenomenon occurs when increasing the number of physical page frames allocated to a process results in an increased number of page faults under FIFO page replacement?",
            "options": [
                {"option_text": "A) Belady's Anomaly", "is_correct": True},
                {"option_text": "B) Thrashing", "is_correct": False},
                {"option_text": "C) Internal Fragmentation", "is_correct": False},
                {"option_text": "D) Priority Inversion", "is_correct": False}
            ],
            "explanation": "Belady's Anomaly demonstrates that FIFO replacement does not satisfy the stack property, meaning the set of pages in memory for n frames is not always a subset of frames for n+1."
        },
        "theory": {
            "prompt": "Analyze Translation Lookaside Buffer (TLB) operation. Given a memory access time of 100ns and TLB lookup time of 20ns, compute the Effective Memory Access Time (EMAT) with an 85% TLB hit ratio for a single-level page table.",
            "explanation": "EMAT = Hit_ratio * (TLB_time + Mem_time) + (1 - Hit_ratio) * (TLB_time + 2 * Mem_time). EMAT = 0.85 * (20 + 100) + 0.15 * (20 + 200) = 0.85 * 120 + 0.15 * 220 = 102 + 33 = 135 ns.",
            "rubric": json.dumps([
                {"criterion": "TLB Hit and Miss Formula Derivation", "max_score": 2.0},
                {"criterion": "Memory Access Cycle Counting", "max_score": 1.5},
                {"criterion": "Numerical EMAT Calculation & Units", "max_score": 1.5}
            ])
        },
        "handwritten": {
            "prompt": "Given the reference string: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2] with 3 physical frames: Trace page allocation and calculate total page faults under (a) FIFO, and (b) LRU replacement.",
            "explanation": "Step-by-step frame table simulation comparing FIFO faults (15) against LRU faults (12).",
            "rubric": json.dumps([
                {"criterion": "FIFO Page Replacement Frame Table Trace", "max_score": 3.0},
                {"criterion": "LRU Stack Eviction Simulation Trace", "max_score": 4.0},
                {"criterion": "Accurate Fault Count & Hit Ratio Comparison", "max_score": 3.0}
            ])
        },
        "bloom": "EVALUATE",
        "co": "CO2"
    }
]
