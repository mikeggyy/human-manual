/**
 * 人類使用說明書：純函式參考核心。無網路、儲存或 UI 相依。
 * 這是娛樂分類規則，不是經心理計量驗證的評估工具。
 * 前端實作時可轉為 TypeScript，但請保留版本與行為測試。
 */

export function validateQuiz(quiz) {
  if (!quiz || typeof quiz !== 'object' || typeof quiz.version !== 'string' || !quiz.version) {
    throw new TypeError('測驗版本不合法。');
  }
  if (!Array.isArray(quiz.types) || quiz.types.length !== 6 ||
      !Array.isArray(quiz.questions) || quiz.questions.length !== 8) {
    throw new TypeError('第一版必須包含 6 種結果與 8 道題目。');
  }
  const typeIds = quiz.types.map(t => t?.id);
  if (typeIds.some(id => typeof id !== 'string' || !id) || new Set(typeIds).size !== 6) {
    throw new TypeError('結果 ID 必須唯一且非空。');
  }
  const questionIds = new Set();
  const optionIds = new Set();
  for (const q of quiz.questions) {
    if (!q || typeof q.id !== 'string' || !q.id || questionIds.has(q.id) ||
        typeof q.title !== 'string' || !q.title || !Array.isArray(q.options) || q.options.length !== 3) {
      throw new TypeError('題目 ID 必須唯一，每題必須有 3 個選項。');
    }
    questionIds.add(q.id);
    for (const opt of q.options) {
      if (!opt || typeof opt.id !== 'string' || !opt.id || optionIds.has(opt.id) ||
          typeof opt.label !== 'string' || !opt.label || !opt.weights ||
          typeof opt.weights !== 'object' || Array.isArray(opt.weights)) {
        throw new TypeError('選項內容或 ID 不合法。');
      }
      optionIds.add(opt.id);
      const weights = Object.entries(opt.weights);
      if (weights.length !== 2 || weights.some(([id,n]) => !typeIds.includes(id) || !Number.isInteger(n) || n <= 0) ||
          weights.map(([,n]) => n).sort((a,b) => a-b).join(',') !== '1,3') {
        throw new TypeError('每個選項必須給一種類型 3 分、另一種類型 1 分。');
      }
    }
  }
  return true;
}

/**
 * @param {object} quiz - quiz.v1.json 內容。
 * @param {string[]} answers - 依題目順序排列的 8 個 option ID；不是 A/B/C 字母。
 * @returns {{ version: string, resultId: string, scores: Record<string, number> }}
 */
export function scoreQuiz(quiz, answers) {
  validateQuiz(quiz);
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    throw new TypeError('必須完成全部 8 題才能計算結果。');
  }
  const selections = quiz.questions.map((q,i) => {
    const selected = q.options.find(opt => opt.id === answers[i]);
    if (!selected) throw new TypeError(`第 ${i+1} 題的答案不合法。`);
    return selected;
  });
  const scores = Object.fromEntries(quiz.types.map(t => [t.id,0]));
  for (const selected of selections) {
    for (const [id,weight] of Object.entries(selected.weights)) scores[id] += weight;
  }
  const max = Math.max(...Object.values(scores));
  let candidates = quiz.types.map(t => t.id).filter(id => scores[id] === max);
  // 平手時，以最後一題到第一題逐題比較，保留該題得分較高的類型。
  // 因每個選項只有一個 3 分與一個 1 分，總分最高者最終可被區分。
  for (let i = selections.length - 1; i >= 0 && candidates.length > 1; i--) {
    const best = Math.max(...candidates.map(id => selections[i].weights[id] ?? 0));
    candidates = candidates.filter(id => (selections[i].weights[id] ?? 0) === best);
  }
  if (candidates.length !== 1) throw new Error('無法決定結果：請檢查題庫與平手規則。');
  return { version: quiz.version, resultId: candidates[0], scores };
}
