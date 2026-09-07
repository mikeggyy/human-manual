import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateQuiz, scoreQuiz } from './score.mjs';
const quiz = JSON.parse(readFileSync(new URL('./quiz.v1.json', import.meta.url), 'utf8'));
const first = quiz.questions.map(q => q.options[0].id);
const clone = () => structuredClone(quiz);

test('題庫結構與類型 ID 均有效', () => assert.equal(validateQuiz(quiz), true));
test('相同答案穩定得到相同結果，不會修改輸入', () => {
  const before = JSON.stringify(quiz);
  assert.deepEqual(scoreQuiz(quiz, first), scoreQuiz(quiz, first));
  assert.equal(JSON.stringify(quiz), before);
});
test('未完成、空值或多餘答案都被拒絕', () => {
  for (const answers of [null,{},[],first.slice(0,7),[...first,first[0]]])
    assert.throws(() => scoreQuiz(quiz,answers), TypeError);
});
test('跨題答案或未知 option ID 都被拒絕', () => {
  assert.throws(() => scoreQuiz(quiz,[first[1],...first.slice(1)]), TypeError);
  assert.throws(() => scoreQuiz(quiz,['unknown',...first.slice(1)]), TypeError);
});
test('選擇依 option ID 判斷，不依選項畫面順序判斷', () => {
  const reordered = clone();
  reordered.questions.forEach(q => q.options.reverse());
  assert.deepEqual(scoreQuiz(quiz,first), scoreQuiz(reordered,first));
});
test('損壞題庫、重複 ID、非法權重都被拒絕', () => {
  const mutations = [
    q => { q.types[0].id = q.types[1].id; },
    q => { q.questions[0].id = q.questions[1].id; },
    q => { q.questions[0].options[0].id = q.questions[1].options[0].id; },
    q => { q.questions[0].options[0].weights = { unknown:3, [q.types[0].id]:1 }; },
    q => { q.questions[0].options[0].weights = { [q.types[0].id]:4 }; },
    q => { q.questions.pop(); },
  ];
  for (const mutate of mutations) { const q = clone(); mutate(q); assert.throws(() => validateQuiz(q),TypeError); }
});
test('回頭改答案後重新計算，不會累加舊答案', () => {
  const changed = [...first]; changed[0] = quiz.questions[0].options[1].id;
  const result = scoreQuiz(quiz,changed);
  assert.equal(Object.values(result.scores).reduce((a,b) => a+b,0),32);
  assert.deepEqual(result,scoreQuiz(quiz,changed));
  assert.notDeepEqual(result.scores,scoreQuiz(quiz,first).scores);
});
test('全部 6,561 條答案路徑都可完成，六種結果皆可到達，包含平手情境', () => {
  const counts = Object.fromEntries(quiz.types.map(t => [t.id,0]));
  let tieCases = 0;
  for (let n=0;n<3**8;n++) {
    let seed=n;
    const answers = quiz.questions.map(q => { const opt=q.options[seed%3]; seed=Math.floor(seed/3); return opt.id; });
    const result = scoreQuiz(quiz,answers);
    assert.ok(Object.hasOwn(counts,result.resultId));
    assert.equal(Object.values(result.scores).reduce((a,b) => a+b,0),32);
    counts[result.resultId]++;
    const max = Math.max(...Object.values(result.scores));
    if (Object.values(result.scores).filter(s => s===max).length > 1) {
      tieCases++;
      // 改變類型宣告順序不應改變平手結果。
      const reordered = clone(); reordered.types.reverse();
      assert.equal(scoreQuiz(reordered,answers).resultId,result.resultId);
    }
  }
  assert.ok(Object.values(counts).every(n => n > 0));
  assert.ok(tieCases > 0);
  console.log('ALL_PATHS_RESULT_COUNTS',JSON.stringify(counts));
  console.log('TIE_CASES',tieCases);
});
