import React, { useState } from 'react';

// ============= AVL TREE IMPLEMENTATION =============
class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
    }
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  getRotationType(node) {
    const balance = this.getBalance(node);
    if (balance > 1) return this.getBalance(node.left) >= 0 ? 'LL' : 'LR';
    if (balance < -1) return this.getBalance(node.right) <= 0 ? 'RR' : 'RL';
    return 'None';
  }

  insert(value) {
    const result = {};
    this.root = this._insert(this.root, value, result);
    return result.nodeAdded;
  }

  _insert(node, value, result) {
    if (!node) { result.nodeAdded = true; return new AVLNode(value); }
    if (value < node.value) node.left = this._insert(node.left, value, result);
    else if (value > node.value) node.right = this._insert(node.right, value, result);
    else { result.nodeAdded = false; return node; }

    this.updateHeight(node);
    const balance = this.getBalance(node);
    if (balance > 1) {
      if (value < node.left.value) return this.rotateRight(node);
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (balance < -1) {
      if (value > node.right.value) return this.rotateLeft(node);
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }

  delete(value) {
    const result = {};
    this.root = this._delete(this.root, value, result);
    return result.nodeDeleted;
  }

  _delete(node, value, result) {
    if (!node) { result.nodeDeleted = false; return null; }
    if (value < node.value) node.left = this._delete(node.left, value, result);
    else if (value > node.value) node.right = this._delete(node.right, value, result);
    else {
      result.nodeDeleted = true;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let min = node.right;
      while (min.left) min = min.left;
      node.value = min.value;
      node.right = this._delete(node.right, min.value, { nodeDeleted: true });
    }
    this.updateHeight(node);
    const balance = this.getBalance(node);
    if (balance > 1) {
      if (this.getBalance(node.left) >= 0) return this.rotateRight(node);
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (balance < -1) {
      if (this.getBalance(node.right) <= 0) return this.rotateLeft(node);
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }

  toArray(node = this.root, result = []) {
    if (node) { this.toArray(node.left, result); result.push(node.value); this.toArray(node.right, result); }
    return result;
  }

  // Deep structural clone — preserves exact tree shape and heights
  copy() {
    const cloneNode = (node) => {
      if (!node) return null;
      const n = new AVLNode(node.value);
      n.height = node.height;
      n.left = cloneNode(node.left);
      n.right = cloneNode(node.right);
      return n;
    };
    const t = new AVLTree();
    t.root = cloneNode(this.root);
    return t;
  }

  // BST insert without AVL rebalancing — for showing intermediate unbalanced state
  _insertBST(node, value) {
    if (!node) return new AVLNode(value);
    if (value < node.value) node.left = this._insertBST(node.left, value);
    else if (value > node.value) node.right = this._insertBST(node.right, value);
    this.updateHeight(node);
    return node;
  }

  // BST delete without AVL rebalancing
  _deleteBST(node, value) {
    if (!node) return null;
    if (value < node.value) { node.left = this._deleteBST(node.left, value); }
    else if (value > node.value) { node.right = this._deleteBST(node.right, value); }
    else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let min = node.right;
      while (min.left) min = min.left;
      node.value = min.value;
      node.right = this._deleteBST(node.right, min.value);
    }
    this.updateHeight(node);
    return node;
  }

  // Returns a copy with the operation applied but WITHOUT rebalancing
  applyOpWithoutBalance(op, value) {
    const t = this.copy();
    if (op === 'insert') t.root = t._insertBST(t.root, value);
    else t.root = t._deleteBST(t.root, value);
    return t;
  }
}

// ============= TREE VISUALIZATION =============
// Uses in-order traversal for x-positions: no overlap, O(n) edge collection
const TreeVisualization = ({ tree, title, highlightValue = null }) => {
  if (!tree || !tree.root) {
    return (
      <div className="flex items-center justify-center h-40 bg-blue-50 rounded-lg border-2 border-blue-200">
        <p className="text-blue-600 font-medium">עץ ריק</p>
      </div>
    );
  }

  // Step 1: in-order traversal assigns columns (left→right sorted order = no horizontal overlap)
  let col = 0;
  let maxDepth = 0;
  const meta = {};
  const assignCols = (node, depth) => {
    if (!node) return;
    assignCols(node.left, depth + 1);
    meta[node.value] = { col: col++, depth, height: node.height, balance: tree.getBalance(node) };
    if (depth > maxDepth) maxDepth = depth;
    assignCols(node.right, depth + 1);
  };
  assignCols(tree.root, 0);

  const n = col; // total node count
  const LEVEL_H = 85;
  // Spacing: at least 65px between node centers, scales down for large trees
  const SPACING = Math.max(65, Math.min(95, 520 / Math.max(n - 1, 1)));
  const SVG_W = Math.max(580, n * SPACING + 60);
  const SVG_H = maxDepth * LEVEL_H + 150;

  // Step 2: convert col/depth → pixel coords
  const pos = {};
  Object.entries(meta).forEach(([v, m]) => {
    pos[v] = {
      x: 30 + m.col * SPACING + SPACING / 2,
      y: 40 + m.depth * LEVEL_H,
      height: m.height,
      balance: m.balance,
    };
  });

  // Step 3: collect edges in one DFS pass — O(n) instead of O(n²)
  const edges = [];
  const collectEdges = (node) => {
    if (!node) return;
    const p = pos[node.value];
    if (node.left) {
      const cp = pos[node.left.value];
      edges.push({ key: `${node.value}-L`, x1: p.x, y1: p.y, x2: cp.x, y2: cp.y });
      collectEdges(node.left);
    }
    if (node.right) {
      const cp = pos[node.right.value];
      edges.push({ key: `${node.value}-R`, x1: p.x, y1: p.y, x2: cp.x, y2: cp.y });
      collectEdges(node.right);
    }
  };
  collectEdges(tree.root);

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-bold text-gray-700 mb-2">{title}</h3>}
      <div className="overflow-x-auto">
        <svg
          width={SVG_W}
          height={SVG_H}
          className="border-2 border-blue-200 bg-white rounded-lg"
          style={{ minWidth: '100%' }}
        >
          {/* Edges first so nodes render on top */}
          {edges.map(e => (
            <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#cbd5e1" strokeWidth="2" />
          ))}

          {/* Nodes */}
          {Object.entries(pos).map(([v, p]) => {
            const value = parseInt(v, 10);
            const isUnbalanced = Math.abs(p.balance) > 1;
            const isHighlighted = value === highlightValue;

            const fill = isUnbalanced ? '#fca5a5' : isHighlighted ? '#86efac' : '#e0e7ff';
            const stroke = isUnbalanced ? '#dc2626' : isHighlighted ? '#16a34a' : '#4f46e5';
            const strokeWidth = (isUnbalanced || isHighlighted) ? '3' : '2';
            const labelColor = isUnbalanced ? '#dc2626' : '#6b7280';

            return (
              <g key={value}>
                <circle cx={p.x} cy={p.y} r="26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                <text
                  x={p.x} y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="15"
                  fontWeight="bold"
                  fill="#1f2937"
                >
                  {value}
                </text>
                <text
                  x={p.x} y={p.y + 42}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill={labelColor}
                >
                  h:{p.height} b:{p.balance}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ============= MAIN APP =============
const EMPTY_STATS = {
  LL: { total: 0, correct: 0 },
  RR: { total: 0, correct: 0 },
  LR: { total: 0, correct: 0 },
  RL: { total: 0, correct: 0 },
  None: { total: 0, correct: 0 },
};

export default function AVLTreeLearningApp() {
  const [mode, setMode] = useState('menu');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [learningTopic, setLearningTopic] = useState(null);

  // Game state
  const [treeBefore, setTreeBefore] = useState(null);
  const [treeIntermediate, setTreeIntermediate] = useState(null);
  const [treeAfter, setTreeAfter] = useState(null);
  const [operation, setOperation] = useState(null);
  const [operationValue, setOperationValue] = useState(null);
  const [correctRotationType, setCorrectRotationType] = useState(null);
  const [gamePhase, setGamePhase] = useState('rotation');
  const [isCorrect, setIsCorrect] = useState(null);
  const [explanation, setExplanation] = useState(null);

  // Score & Stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [rotationStats, setRotationStats] = useState(EMPTY_STATS);
  const [showStats, setShowStats] = useState(false);

  const generateTree = (diff = difficulty) => {
    const tree = new AVLTree();
    let count;
    switch (diff) {
      case 'Beginner':     count = 4 + Math.floor(Math.random() * 3); break;
      case 'Intermediate': count = 6 + Math.floor(Math.random() * 3); break;
      case 'Advanced':     count = 8 + Math.floor(Math.random() * 4); break;
      default:             count = 5;
    }
    const values = new Set();
    while (values.size < count) values.add(Math.floor(Math.random() * 100) + 1);
    Array.from(values).forEach(v => tree.insert(v));
    return tree;
  };

  // Computes and sets the next question state — no recursion
  const setupOperation = (tree) => {
    const existing = tree.toArray();
    const canDelete = existing.length > 0;
    const isInsert = !canDelete || Math.random() > 0.4;
    let value;

    if (isInsert) {
      do { value = Math.floor(Math.random() * 100) + 1; } while (existing.includes(value));
    } else {
      value = existing[Math.floor(Math.random() * existing.length)];
    }

    const op = isInsert ? 'insert' : 'delete';

    // Intermediate: BST operation WITHOUT rebalancing — shows the unbalanced state
    const intermediate = tree.applyOpWithoutBalance(op, value);

    // Find first unbalanced node via in-order traversal on the intermediate tree
    const findUnbalanced = (node) => {
      if (!node) return null;
      const fromLeft = findUnbalanced(node.left);
      if (fromLeft) return fromLeft;
      if (Math.abs(intermediate.getBalance(node)) > 1) return node;
      return findUnbalanced(node.right);
    };
    const unbalancedNode = findUnbalanced(intermediate.root);
    const correct = unbalancedNode ? intermediate.getRotationType(unbalancedNode) : 'None';

    setOperation(op);
    setOperationValue(value);
    setTreeIntermediate(intermediate);
    setCorrectRotationType(correct);
    setGamePhase('rotation');
    setIsCorrect(null);
    setExplanation(null);
  };

  // Pass diff directly — avoids stale state from setDifficulty
  const startGame = (diff = difficulty) => {
    const tree = generateTree(diff);
    setTreeBefore(tree.copy());
    setTreeAfter(null);
    setupOperation(tree);
    setMode('gaming');
  };

  const handleRotationSelect = (rotation) => {
    // Build the correctly balanced tree for the result display
    const balanced = treeBefore.copy();
    if (operation === 'insert') balanced.insert(operationValue);
    else balanced.delete(operationValue);
    setTreeAfter(balanced);

    const isCorrectAnswer = rotation === correctRotationType;
    setIsCorrect(isCorrectAnswer);
    setGamePhase('result');

    setRotationStats(prev => ({
      ...prev,
      [correctRotationType]: {
        total: prev[correctRotationType].total + 1,
        correct: prev[correctRotationType].correct + (isCorrectAnswer ? 1 : 0),
      },
    }));

    if (isCorrectAnswer) {
      const points = 10 + combo * 2;
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setExplanation(`✅ כל הכבוד! הרוטציה ${correctRotationType} היא הנכונה! (+${points} נקודות)`);
    } else {
      setCombo(0);
      setExplanation(`❌ טעות. הרוטציה הנכונה היא ${correctRotationType}, לא ${rotation}.`);
    }

    setQuestionsAnswered(prev => prev + 1);
  };

  const nextQuestion = () => {
    const tree = generateTree();
    setTreeBefore(tree.copy());
    setTreeAfter(null);
    setupOperation(tree);
  };

  const renderLearning = () => {
    const topics = {
      about: {
        title: 'מה זה עץ AVL?',
        content: `עץ AVL הוא עץ חיפוש בינארי מאוזן עצמית. כל צומת שומר על גורם איזון (Balance Factor) בטווח [-1, 1].

Balance Factor = גובה תת-עץ שמאלי − גובה תת-עץ ימני

עצי AVL מבטיחים שפעולות insert, delete, search רצות ב-O(log n) גם במקרה הגרוע — בניגוד לעץ BST רגיל שיכול להידרדר ל-O(n).`,
      },
      balance: {
        title: 'Balance Factor (גורם איזון)',
        content: `BF = height(left subtree) − height(right subtree)

• BF = 0  → מאוזן לחלוטין
• BF = ±1 → מאוזן (מותר)
• BF = +2 → שמאל כבד מדי — נדרשת רוטציה!
• BF = −2 → ימין כבד מדי — נדרשת רוטציה!

הצמתים המסומנים באדום בהדמיה הם צמתים שה-BF שלהם חורג מ-±1.`,
      },
      rotations: {
        title: 'ארבע סוגי הרוטציות',
        content: `LL (Left-Left)
  הצומת הלא-מאוזן: BF = +2, ובנו השמאלי: BF ≥ 0
  תיקון: סיבוב ימינה (rotate right) על הצומת הלא-מאוזן

RR (Right-Right)
  הצומת הלא-מאוזן: BF = −2, ובנו הימני: BF ≤ 0
  תיקון: סיבוב שמאלה (rotate left) על הצומת הלא-מאוזן

LR (Left-Right)
  הצומת הלא-מאוזן: BF = +2, ובנו השמאלי: BF < 0
  תיקון: סיבוב שמאלה על הבן השמאלי, ואז סיבוב ימינה על הצומת הלא-מאוזן

RL (Right-Left)
  הצומת הלא-מאוזן: BF = −2, ובנו הימני: BF > 0
  תיקון: סיבוב ימינה על הבן הימני, ואז סיבוב שמאלה על הצומת הלא-מאוזן`,
      },
      examples: {
        title: 'דוגמאות אינטראקטיביות',
        content: 'עבור למצב משחק כדי לתרגל עם עצים אקראיים ולראות את הרוטציות בפעולה!',
      },
    };

    const topic = topics[learningTopic];
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLearningTopic(null)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            ← חזור
          </button>
          <h2 className="text-2xl font-bold text-blue-900">{topic?.title}</h2>
        </div>
        <pre className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans text-base mb-4">{topic?.content}</pre>
        {learningTopic === 'examples' && (
          <button onClick={() => setMode('gameStart')} className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold">
            🎮 התחל משחק
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
            🌳 AVL Tree Master 🌳
          </h1>
          <p className="text-gray-600 text-base">למד ותרגל עצי AVL בצורה אינטראקטיבית</p>
        </div>

        {/* MENU */}
        {mode === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setMode('learning')}
              className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition border-4 border-blue-300"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">מצב למידה</h3>
              <p className="text-gray-600">הסברים על AVL, Balance Factor ורוטציות</p>
            </button>
            <button
              onClick={() => setMode('gameStart')}
              className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition border-4 border-green-300"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">מצב משחק</h3>
              <p className="text-gray-600">זהה את הרוטציה הנדרשת וצבור נקודות</p>
            </button>
          </div>
        )}

        {/* LEARNING LIST */}
        {mode === 'learning' && !learningTopic && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setMode('menu')} className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              ← חזור לתפריט
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'about',     label: '📖 מה זה AVL?' },
                { key: 'balance',   label: '⚖️ Balance Factor' },
                { key: 'rotations', label: '🔄 סוגי הרוטציות' },
                { key: 'examples',  label: '🎯 דוגמאות' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setLearningTopic(key)}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition text-right"
                >
                  <h3 className="text-lg font-bold text-gray-800">{label}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LEARNING TOPIC */}
        {mode === 'learning' && learningTopic && renderLearning()}

        {/* GAME START */}
        {mode === 'gameStart' && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setMode('menu')} className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              ← חזור לתפריט
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">בחר רמת קושי</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { diff: 'Beginner',     emoji: '🌱', label: 'מתחיל',  desc: '4–6 צמתים' },
                { diff: 'Intermediate', emoji: '🌿', label: 'בינוני', desc: '6–8 צמתים' },
                { diff: 'Advanced',     emoji: '🌳', label: 'מתקדם',  desc: '8–12 צמתים' },
              ].map(({ diff, emoji, label, desc }) => (
                <button
                  key={diff}
                  onClick={() => {
                    setDifficulty(diff);
                    setScore(0);
                    setCombo(0);
                    setQuestionsAnswered(0);
                    setRotationStats(EMPTY_STATS);
                    setShowStats(false);
                    startGame(diff);
                  }}
                  className={`p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition border-4 ${
                    difficulty === diff
                      ? 'bg-gradient-to-br from-yellow-300 to-orange-300 border-orange-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="text-4xl mb-3">{emoji}</div>
                  <h3 className="text-xl font-bold text-gray-800">{label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAMING */}
        {mode === 'gaming' && (
          <div className="max-w-6xl mx-auto">
            {/* Score bar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'ניקוד',  value: score,            color: 'text-blue-600' },
                { label: 'קומבו',  value: `${combo}🔥`,    color: 'text-green-600' },
                { label: 'שאלות', value: questionsAnswered, color: 'text-purple-600' },
                {
                  label: 'רמה',
                  value: difficulty === 'Beginner' ? '🌱 מתחיל' : difficulty === 'Intermediate' ? '🌿 בינוני' : '🌳 מתקדם',
                  color: 'text-orange-600',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white p-4 rounded-lg shadow text-center">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* ROTATION PHASE */}
            {gamePhase === 'rotation' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-center mb-1">
                  {operation === 'insert' ? `➕ הוסף ${operationValue}` : `➖ הסר ${operationValue}`}
                </h2>
                <p className="text-center text-sm text-gray-400 mb-6">
                  ירוק = הצומת שהשתנה &nbsp;|&nbsp; אדום = צומת לא-מאוזן (|BF| &gt; 1)
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  <TreeVisualization
                    tree={treeBefore}
                    title="העץ לפני הפעולה"
                    highlightValue={operation === 'delete' ? operationValue : null}
                  />
                  <TreeVisualization
                    tree={treeIntermediate}
                    title="אחרי הפעולה — לפני רוטציה"
                    highlightValue={operation === 'insert' ? operationValue : null}
                  />
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 mb-4">איזו רוטציה נדרשת?</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['LL', 'RR', 'LR', 'RL', 'None'].map(rot => (
                      <button
                        key={rot}
                        onClick={() => handleRotationSelect(rot)}
                        className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 font-bold text-lg transform hover:scale-110 transition shadow-md"
                      >
                        {rot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULT PHASE */}
            {gamePhase === 'result' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className={`text-3xl font-bold text-center mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✅ כל הכבוד!' : '❌ לא נכון'}
                </h2>
                <p className="text-lg text-center text-gray-700 mb-6">{explanation}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  <TreeVisualization tree={treeBefore} title="לפני" />
                  <TreeVisualization tree={treeAfter} title="אחרי (מאוזן)" />
                </div>

                <div className="text-center">
                  <button
                    onClick={nextQuestion}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 font-bold text-lg transform hover:scale-105 transition shadow-md"
                  >
                    שאלה הבאה ←
                  </button>
                </div>
              </div>
            )}

            {/* Bottom bar */}
            <div className="flex justify-between items-center mt-6">
              <button onClick={() => setMode('menu')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">
                ← חזור לתפריט
              </button>
              <button
                onClick={() => setShowStats(s => !s)}
                className="px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold text-sm"
              >
                {showStats ? '✕ סגור סטטיסטיקות' : '📊 סטטיסטיקות'}
              </button>
            </div>

            {/* Stats panel */}
            {showStats && (
              <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-center">📊 ביצועים לפי סוג רוטציה</h3>
                <div className="grid grid-cols-5 gap-3">
                  {['LL', 'RR', 'LR', 'RL', 'None'].map(rot => {
                    const s = rotationStats[rot];
                    const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                    const barColor = pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400';
                    return (
                      <div key={rot} className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="font-bold text-base mb-1">{rot}</p>
                        <p className="text-2xl font-bold text-blue-600">{pct}%</p>
                        <p className="text-xs text-gray-500">{s.correct}/{s.total}</p>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
