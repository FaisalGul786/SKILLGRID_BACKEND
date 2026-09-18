import {redis} from "../../shared/redis_database/upstash-client.js"

export const QuizDraftService = {
  // Batch save student draft choices in a Redis Hash
  async saveDraft(studentId, quizId, answers, ttlMinutes = 120) {
    if (!answers || !answers.length) return;
    const key = `quiz:draft:${studentId}:${quizId}`;

    const hashData = {};
    for (const ans of answers) {
      if (ans.questionId && ans.selectedOptionId) {
        hashData[ans.questionId] = ans.selectedOptionId;
      }
    }

    if (Object.keys(hashData).length > 0) {
      await redis.hset(key, hashData);
      await redis.expire(key, ttlMinutes * 60);
    }
  },

  // Fetch saved draft choices on quiz resume
  async getDraft(studentId, quizId) {
    const key = `quiz:draft:${studentId}:${quizId}`;
    const rawData = await redis.hgetall(key);

    if (!rawData || Object.keys(rawData).length === 0) return [];

    return Object.entries(rawData).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
  },

  // Delete draft upon final DB submission
  async clearDraft(studentId, quizId) {
    const key = `quiz:draft:${studentId}:${quizId}`;
    await redis.del(key);
  },
};