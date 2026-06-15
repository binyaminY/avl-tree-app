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
    if (balance > 1) {
      return this.getBalance(node.left) >= 0 ? 'LL' : 'LR';
    }
    if (balance < -1) {
      return this.getBalance(node.right) <= 0 ? 'RR' : 'RL';
    }
    return 'None';
  }

  insert(value) {
    const result = {};
    this.root = this._insert(this.root, value, result);
    return result.nodeAdded;
  }

  _insert(node, value, result) {
    if (!node) {
      result.nodeAdded = true;
      return new AVLNode(value);
    }
    if (value < node.value) {
      node.left = this._insert(node.left, value, result);
    } else if (value > node.value) {
      node.right = this._insert(node.right, value, result);
    } else {
      result.nodeAdded = false;
      return node;
    }
    this.updateHeight(node);
    const balance = this.getBalance(node);
    if (balance > 1) {
      if (value < node.left.value) {
        return this.rotateRight(node);
      } else {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }
    }
    if (balance < -1) {
      if (value > node.right.value) {
        return this.rotateLeft(node);
      } else {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }
    }
    return node;
  }

  delete(value) {
    const result = {};
    this.root = this._delete(this.root, value, result);
    return result.nodeDeleted;
  }

  _delete(node, value, result) {
    if (!node) {
      result.nodeDeleted = false;
      return null;
    }
    if (value < node.value) {
      node.left = this._delete(node.left, value, result);
    } else if (value > node.value) {
      node.right = this._delete(node.right, value, result);
    } else {
      result.nodeDeleted = true;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let minLargerNode = node.right;
      while (minLargerNode.left) minLargerNode = minLargerNode.left;
      node.value = minLargerNode.value;
      node.right = this._delete(node.right, minLargerNode.value, { nodeDeleted: true });
    }
    this.updateHeight(node);
    const balance = this.getBalance(node);
    if (balance > 1) {
      if (this.getBalance(node.left) >= 0) {
        return this.rotateRight(node);
      } else {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }
    }
    if (balance < -1) {
      if (this.getBalance(node.right) <= 0) {
        return this.rotateLeft(node);
      } else {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }
    }
    return node;
  }

  toArray(node = this.root, result = []) {
    if (node) {
      this.toArray(node.left, result);
      result.push(node.value);
      this.toArray(node.right, result);
    }
    return result;
  }

  // Deep structural clone — preserves exact tree shape
  copy() {
    const cloneNode = (node) => {
      if (!node) return null;
      const n = new AVLNode(node.value);
      n.height = node.height;
      n.left = cloneNode(node.left);
      n.right = cloneNode(node.right);
      return n;
    };
    const newTree = new AVLTree();
    newTree.root = cloneNode(this.root);
    return newTree;
  }

  // BST insert without AVL rebalancing (for showing intermediate unbalanced state)
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
    if (value < node.value) {
      node.left = this._deleteBST(node.left, value);
    } else if (value > node.value) {
      node.right = this._deleteBST(node.right, value);
    } else {
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

  // Returns a copy of this tree with the operation applied but WITHOUT rebalancing
  applyOpWithoutBalance(op, value) {
    const newTree = this.copy();
    if (op === 'insert') {
      newTree.root = newTree._insertBST(newTree.root, value);
    } else {
      newTree.root = newTree._deleteBST(newTree.root, value);
    }
    return newTree;
  }
}

// ============= TREE VISUALIZATION =============
const TreeVisualization = ({ tree, highlightNode = null, animatingNodes = [], title }) => {
  if (!tree || !tree.root) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <p className="text-blue-600 font-medium">עץ ריק</p>
      </div>
    );
  }

  const nodePositions = {};
  let maxY = 0;

  const calculatePositions = (node, x, y, offset) => {
    if (!node) return;
    nodePositions[node.value] = { x, y, height: node.height, balance: tree.getBalance(node) };
    maxY = Math.max(maxY, y);
    if (node.left) calculatePositions(node.left, x - offset, y + 100, offset / 2);
    if (node.right) calculatePositions(node.right, x + offset, y + 100, offset / 2);
  };

  calculatePositions(tree.root, 300, 40, 120);

  const svgHeight = maxY + 140;

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-bold text-gray-700 mb-2">{title}</h3>}
      <svg width="100%" height={svgHeight} viewBox={`0 0 600 ${svgHeight}`} className="border-2 border-blue-200 bg-white rounded-lg">
        {Object.entries(nodePositions).map(([val, pos]) => {
          const value = parseInt(val, 10);
          const lines = [];

          const findNode = (node) => {
            if (!node) return null;
            if (node.value === value) return node;
            return findNode(node.left) || findNode(node.right);
          };

          const node = findNode(tree.root);
          if (node?.left) {
            const childPos = nodePositions[node.left.value];
            lines.push(
              <line key={`line-${value}-left`} x1={pos.x} y1={pos.y} x2={childPos.x} y2={childPos.y} stroke="#cbd5e1" strokeWidth="2" />
            );
          }
          if (node?.right) {
            const childPos = nodePositions[node.right.value];
            lines.push(
              <line key={`line-${value}-right`} x1={pos.x} y1={pos.y} x2={childPos.x} y2={childPos.y} stroke="#cbd5e1" strokeWidth="2" />
            );
          }
          return lines;
        })}

        {Object.entries(nodePositions).map(([val, pos]) => {
          const value = parseInt(val, 10);
          const isHighlighted = highlightNode === value;
          const isAnimating = animatingNodes.includes(value);
          const isUnbalanced = Math.abs(pos.balance) > 1;
          const bgColor = isHighlighted ? '#fbbf24' : isAnimating ? '#34d399' : isUnbalanced ? '#fca5a5' : '#e0e7ff';
          const borderColor = isHighlighted ? '#d97706' : isUnbalanced ? '#dc2626' : '#4f46e5';

          return (
            <g key={`node-${value}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="28"
                fill={bgColor}
                stroke={borderColor}
                strokeWidth={isHighlighted || isUnbalanced ? '3' : '2'}
                style={{ transition: 'all 0.3s ease' }}
              />
              <text x={pos.x} y={pos.y} textAnchor="middle" dy="0.3em" fontSize="16" fontWeight="bold" fill="#1f2937">
                {value}
              </text>
              <text x={pos.x} y={pos.y + 45} textAnchor="middle" fontSize="11" fill={isUnbalanced ? '#dc2626' : '#6b7280'}>
                h:{pos.height} b:{pos.balance}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ============= MAIN APP =============
export default function AVLTreeLearningApp() {
  const [mode, setMode] = useState('menu');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [learningTopic, setLearningTopic] = useState(null);

  // Game state
  const [currentTree, setCurrentTree] = useState(null);
  const [treeBefore, setTreeBefore] = useState(null);
  const [treeIntermediate, setTreeIntermediate] = useState(null);
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
  const [rotationStats, setRotationStats] = useState({
    LL: { total: 0, correct: 0 },
    RR: { total: 0, correct: 0 },
    LR: { total: 0, correct: 0 },
    RL: { total: 0, correct: 0 },
    None: { total: 0, correct: 0 }
  });
  const [showStats, setShowStats] = useState(false);

  const generateTree = (diff = difficulty) => {
    const tree = new AVLTree();
    let count;
    switch (diff) {
      case 'Beginner': count = 4 + Math.floor(Math.random() * 3); break;
      case 'Intermediate': count = 6 + Math.floor(Math.random() * 3); break;
      case 'Advanced': count = 8 + Math.floor(Math.random() * 4); break;
      default: count = 5;
    }
    const values = new Set();
    while (values.size < count) {
      values.add(Math.floor(Math.random() * 100) + 1);
    }
    Array.from(values).forEach(v => tree.insert(v));
    return tree;
  };

  const generateNextOperation = (tree) => {
    const isInsert = Math.random() > 0.4;
    const existing = tree.toArray();
    let value;

    if (isInsert) {
      do {
        value = Math.floor(Math.random() * 100) + 1;
      } while (existing.includes(value));
    } else {
      if (existing.length === 0) {
        generateNextOperation(tree);
        return;
      }
      value = existing[Math.floor(Math.random() * existing.length)];
    }

    const op = isInsert ? 'insert' : 'delete';

    // Build intermediate tree: BST operation WITHOUT rebalancing
    // This lets us detect which rotation is actually needed
    const intermediate = tree.applyOpWithoutBalance(op, value);

    // Find first unbalanced node (in-order) in the intermediate tree
    const findUnbalancedNode = (node) => {
      if (!node) return null;
      const left = findUnbalancedNode(node.left);
      if (left) return left;
      if (Math.abs(intermediate.getBalance(node)) > 1) return node;
      return findUnbalancedNode(node.right);
    };

    const unbalanced = findUnbalancedNode(intermediate.root);
    const correct = unbalanced ? intermediate.getRotationType(unbalanced) : 'None';

    setOperation(op);
    setOperationValue(value);
    setTreeIntermediate(intermediate);
    setCorrectRotationType(correct);
    setGamePhase('rotation');
    setIsCorrect(null);
  };

  // diff passed directly to avoid stale state from setDifficulty
  const startGame = (diff = difficulty) => {
    const tree = generateTree(diff);
    setCurrentTree(tree);
    setTreeBefore(tree.copy());
    generateNextOperation(tree);
    setMode('gaming');
  };

  const handleRotationSelect = (rotation) => {
    // Apply AVL-balanced operation for the result display
    const balancedTree = treeBefore.copy();
    if (operation === 'insert') {
      balancedTree.insert(operationValue);
    } else {
      balancedTree.delete(operationValue);
    }
    setCurrentTree(balancedTree);

    const isCorrectAnswer = rotation === correctRotationType;
    setIsCorrect(isCorrectAnswer);

    setRotationStats(prev => ({
      ...prev,
      [correctRotationType]: {
        total: prev[correctRotationType].total + 1,
        correct: prev[correctRotationType].correct + (isCorrectAnswer ? 1 : 0)
      }
    }));

    if (isCorrectAnswer) {
      setScore(prev => prev + (10 + combo * 2));
      setCombo(prev => prev + 1);
      setExplanation(`✅ כל הכבוד! הרוטציה ${correctRotationType} היא הנכונה! (+${10 + combo * 2} נקודות)`);
    } else {
      setCombo(0);
      setExplanation(`❌ טעות. הרוטציה הנכונה היא ${correctRotationType}, לא ${rotation}.`);
    }

    setQuestionsAnswered(prev => prev + 1);
    setGamePhase('result');
  };

  const nextQuestion = () => {
    const tree = generateTree();
    setCurrentTree(tree);
    setTreeBefore(tree.copy());
    setIsCorrect(null);
    setExplanation(null);
    generateNextOperation(tree);
  };

  // Learning mode content
  const renderLearning = () => {
    const topics = {
      about: {
        title: 'מה זה עץ AVL?',
        content: `עץ AVL הוא עץ חיפוש בינארי מאוזן עצמית. כל צומת שומרת על איזון על ידי תחזוקת הפרש גבהים בין תת-עץ שמאלי וימני.

עצי AVL מבטיחים שפעולות insert, delete, search רצות ב-O(log n) גם במקרה הגרוע.

Balance Factor = גובה תת-עץ שמאלי - גובה תת-עץ ימני

עץ AVL תקין: לכל צומת, ה-Balance Factor בטווח [-1, 1].`
      },
      balance: {
        title: 'Balance Factor (גורם איזון)',
        content: `Balance Factor חושב עבור כל צומת:
BF = height(left) - height(right)

דוגמאות:
- BF = 0 → עץ מאוזן לחלוטין
- BF = 1 → שמאל קצת גדול יותר, עדיין מאוזן
- BF = -1 → ימין קצת גדול יותר, עדיין מאוזן
- BF = 2 → שמאל כבד מדי — צריך רוטציה!
- BF = -2 → ימין כבד מדי — צריך רוטציה!

הצמתים האדומים בהדמיה מסמנים צמתים לא מאוזנים (|BF| > 1).`
      },
      rotations: {
        title: 'ארבע סוגי הרוטציות',
        content: `כשעץ מאבד איזון, מבצעים רוטציה:

LL Rotation (Left-Left)
הבעיה: הוספה לתת-עץ שמאלי של הבן השמאלי
הפתרון: סיבוב ימינה של הצומת הלא-מאוזן

RR Rotation (Right-Right)
הבעיה: הוספה לתת-עץ ימני של הבן הימני
הפתרון: סיבוב שמאלה של הצומת הלא-מאוזן

LR Rotation (Left-Right)
הבעיה: הוספה לתת-עץ ימני של הבן השמאלי
הפתרון: סיבוב שמאלה של הבן השמאלי, ואז סיבוב ימינה

RL Rotation (Right-Left)
הבעיה: הוספה לתת-עץ שמאלי של הבן הימני
הפתרון: סיבוב ימינה של הבן הימני, ואז סיבוב שמאלה`
      },
      examples: {
        title: 'דוגמאות אינטראקטיביות',
        content: 'בדוק כמה דוגמאות ולמד איך הרוטציות עובדות!'
      }
    };

    const topic = topics[learningTopic];

    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setLearningTopic(null)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            ← חזור
          </button>
          <h2 className="text-2xl font-bold text-blue-900">{topic?.title}</h2>
        </div>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-4">{topic?.content}</p>

        {learningTopic === 'examples' && (
          <div className="mt-6">
            <p className="text-gray-600 mb-4">בואו נתחיל במשחק כדי לראות דוגמאות!</p>
            <button onClick={() => setMode('gameStart')} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold">
              🎮 התחל משחק
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
            🌳 AVL Tree Master 🌳
          </h1>
          <p className="text-gray-700 text-lg">למד ותרגל עצי AVL בצורה אינטראקטיבית!</p>
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
              <p className="text-gray-600">למד על עצי AVL עם הסברים מלאים</p>
            </button>

            <button
              onClick={() => setMode('gameStart')}
              className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition border-4 border-green-300"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">מצב משחק</h3>
              <p className="text-gray-600">תרגל וקבל ניקוד על תשובות נכונות</p>
            </button>
          </div>
        )}

        {/* LEARNING */}
        {mode === 'learning' && !learningTopic && (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setMode('menu')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-6">
              ← חזור לתפריט
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['about', 'balance', 'rotations', 'examples'].map(topic => (
                <button
                  key={topic}
                  onClick={() => setLearningTopic(topic)}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {topic === 'about' && '📖 מה זה AVL?'}
                    {topic === 'balance' && '⚖️ Balance Factor'}
                    {topic === 'rotations' && '🔄 סוגי הרוטציות'}
                    {topic === 'examples' && '🎯 דוגמאות'}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LEARNING TOPIC */}
        {mode === 'learning' && learningTopic && renderLearning()}

        {/* GAME START - SELECT DIFFICULTY */}
        {mode === 'gameStart' && (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setMode('menu')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-6">
              ← חזור לתפריט
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">בחר רמת קושי:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff);
                      setScore(0);
                      setCombo(0);
                      setQuestionsAnswered(0);
                      setRotationStats({ LL: { total: 0, correct: 0 }, RR: { total: 0, correct: 0 }, LR: { total: 0, correct: 0 }, RL: { total: 0, correct: 0 }, None: { total: 0, correct: 0 } });
                      startGame(diff);
                    }}
                    className={`p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition border-4 ${
                      difficulty === diff ? 'bg-gradient-to-br from-yellow-300 to-orange-300 border-orange-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-3">
                      {diff === 'Beginner' && '🌱'}
                      {diff === 'Intermediate' && '🌿'}
                      {diff === 'Advanced' && '🌳'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {diff === 'Beginner' ? 'מתחיל' : diff === 'Intermediate' ? 'בינוני' : 'מתקדם'}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GAMING */}
        {mode === 'gaming' && (
          <div className="max-w-6xl mx-auto">
            {/* Header Info */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-sm text-gray-600">ניקוד</p>
                <p className="text-3xl font-bold text-blue-600">{score}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-sm text-gray-600">קומבו</p>
                <p className="text-3xl font-bold text-green-600">{combo}🔥</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-sm text-gray-600">שאלות</p>
                <p className="text-3xl font-bold text-purple-600">{questionsAnswered}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-sm text-gray-600">רמה</p>
                <p className="text-xl font-bold text-orange-600">
                  {difficulty === 'Beginner' ? '🌱 מתחיל' : difficulty === 'Intermediate' ? '🌿 בינוני' : '🌳 מתקדם'}
                </p>
              </div>
            </div>

            {/* ROTATION PHASE — shows tree before op and unbalanced intermediate */}
            {gamePhase === 'rotation' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center mb-2">
                  {operation === 'insert' ? `➕ הוסף ${operationValue}` : `➖ הסר ${operationValue}`}
                </h2>
                <p className="text-center text-gray-500 mb-6 text-sm">
                  הצמתים האדומים מסמנים אי-איזון (|BF| &gt; 1)
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <TreeVisualization tree={treeBefore} title="העץ לפני הפעולה" />
                  <TreeVisualization tree={treeIntermediate} title="אחרי הפעולה (לפני רוטציה)" />
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 mb-6">איזו רוטציה נדרשת?</p>
                  <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
                    {['LL', 'RR', 'LR', 'RL', 'None'].map(rot => (
                      <button
                        key={rot}
                        onClick={() => handleRotationSelect(rot)}
                        className="px-4 py-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 font-bold text-lg transform hover:scale-110 transition"
                      >
                        {rot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULT PHASE — shows before and after (balanced) */}
            {gamePhase === 'result' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className={`text-3xl font-bold text-center mb-6 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✅ כל הכבוד!' : '❌ לא נכון'}
                </h2>

                <p className="text-lg text-center text-gray-700 mb-6">{explanation}</p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <TreeVisualization tree={treeBefore} title="העץ לפני" />
                  <TreeVisualization tree={currentTree} title="העץ המאוזן אחרי הפעולה" />
                </div>

                <div className="text-center">
                  <button
                    onClick={nextQuestion}
                    className="px-8 py-4 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:from-green-500 hover:to-green-700 font-bold text-lg transform hover:scale-110 transition"
                  >
                    → שאלה הבאה
                  </button>
                </div>
              </div>
            )}

            {/* Bottom controls */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setMode('menu')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                ← חזור לתפריט
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold"
              >
                {showStats ? '✕ סגור סטטיסטיקות' : '📊 סטטיסטיקות'}
              </button>
            </div>

            {showStats && (
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">📊 ביצועים</h3>
                <div className="grid grid-cols-5 gap-4">
                  {['LL', 'RR', 'LR', 'RL', 'None'].map(rot => {
                    const stat = rotationStats[rot];
                    const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                    return (
                      <div key={rot} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg text-center">
                        <p className="font-bold text-lg mb-2">{rot}</p>
                        <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
                        <p className="text-sm text-gray-600">{stat.correct}/{stat.total}</p>
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
