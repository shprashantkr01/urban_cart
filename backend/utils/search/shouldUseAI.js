const shouldUseAI = (q, words, basicCount) => {

  if (basicCount < 3) {
    return true;
  }

  if (words.length > 3) {
    return true;
  }

  return /\b(affordable|cheap|best|recommend|suggest|need|want|for|with|size|color|material|style|occasion|winter|summer|autumn|spring)\b/i.test(q);
};

export default shouldUseAI;