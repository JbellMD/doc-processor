"""
Document Analyzer Module

This module provides functionality to analyze document content using NLP techniques,
including summarization, keyword extraction, entity recognition, and topic modeling.
"""

import re
import logging
from typing import Dict, List, Any, Tuple, Optional
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
from nltk.stem import WordNetLemmatizer
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from transformers import pipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Download required NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

class DocumentAnalyzer:
    """
    A class for analyzing document content using various NLP techniques.
    """
    
    def __init__(self, language: str = 'en'):
        """
        Initialize the document analyzer.
        
        Args:
            language: Language code (default: 'en' for English)
        """
        self.language = language
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Initialize spaCy model
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except OSError:
            logger.warning("Downloading spaCy model 'en_core_web_sm'...")
            spacy.cli.download('en_core_web_sm')
            self.nlp = spacy.load('en_core_web_sm')
        
        # Initialize transformers pipelines
        self.summarizer = None
        self.classifier = None
    
    def _load_summarizer(self):
        """Lazy load the summarization model."""
        if self.summarizer is None:
            logger.info("Loading summarization model...")
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    def _load_classifier(self):
        """Lazy load the zero-shot classification model."""
        if self.classifier is None:
            logger.info("Loading zero-shot classification model...")
            self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    
    def analyze(self, text: str, options: Dict[str, bool] = None) -> Dict[str, Any]:
        """
        Analyze document text and extract insights.
        
        Args:
            text: Document text to analyze
            options: Dictionary of analysis options to enable/disable
                    (keywords, entities, summary, topics, sentiment)
        
        Returns:
            Dictionary containing analysis results
        """
        if not text or not text.strip():
            return {"error": "Empty text provided for analysis"}
        
        # Default options
        if options is None:
            options = {
                "keywords": True,
                "entities": True,
                "summary": True,
                "topics": True,
                "sentiment": False,
                "readability": True
            }
        
        results = {
            "text_length": len(text),
            "word_count": len(word_tokenize(text))
        }
        
        # Extract sentences
        sentences = sent_tokenize(text)
        results["sentence_count"] = len(sentences)
        
        # Add requested analyses
        if options.get("keywords", True):
            results["keywords"] = self.extract_keywords(text)
        
        if options.get("entities", True):
            results["entities"] = self.extract_entities(text)
        
        if options.get("summary", True):
            results["summary"] = self.summarize(text)
        
        if options.get("topics", True):
            results["topics"] = self.extract_topics(text)
        
        if options.get("sentiment", False):
            results["sentiment"] = self.analyze_sentiment(text)
        
        if options.get("readability", True):
            results["readability"] = self.calculate_readability(text)
        
        return results
    
    def extract_keywords(self, text: str, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Extract key terms from text using TF-IDF.
        
        Args:
            text: Text to analyze
            top_n: Number of top keywords to return
            
        Returns:
            List of dictionaries containing keywords and their scores
        """
        # Tokenize and preprocess text
        tokens = word_tokenize(text.lower())
        tokens = [token for token in tokens if token.isalnum()]
        tokens = [token for token in tokens if token not in self.stop_words]
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens]
        
        # Calculate word frequencies
        freq_dist = FreqDist(tokens)
        
        # Use TF-IDF for single document
        sentences = sent_tokenize(text)
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Calculate average TF-IDF score for each term
        tfidf_scores = {}
        for i, sentence in enumerate(sentences):
            sentence_tokens = word_tokenize(sentence.lower())
            sentence_tokens = [token for token in sentence_tokens if token.isalnum()]
            
            for token in set(sentence_tokens):
                if token in self.stop_words:
                    continue
                
                lemma = self.lemmatizer.lemmatize(token)
                if lemma in feature_names:
                    idx = list(feature_names).index(lemma)
                    score = tfidf_matrix[i, idx]
                    if lemma in tfidf_scores:
                        tfidf_scores[lemma] += score
                    else:
                        tfidf_scores[lemma] = score
        
        # Normalize by frequency
        for term in tfidf_scores:
            if term in freq_dist:
                tfidf_scores[term] = tfidf_scores[term] * freq_dist[term]
        
        # Sort by score and get top N
        sorted_keywords = sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Return as list of dictionaries
        return [{"keyword": kw, "score": float(score)} for kw, score in sorted_keywords[:top_n]]
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract named entities from text using spaCy.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary of entity types and their values
        """
        doc = self.nlp(text)
        
        entities = {}
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            
            # Avoid duplicates
            if ent.text not in entities[ent.label_]:
                entities[ent.label_].append(ent.text)
        
        return entities
    
    def summarize(self, text: str, max_length: int = 150, min_length: int = 40) -> str:
        """
        Generate a summary of the text using transformers.
        
        Args:
            text: Text to summarize
            max_length: Maximum summary length
            min_length: Minimum summary length
            
        Returns:
            Generated summary
        """
        # For very short texts, return the original
        if len(text.split()) < min_length:
            return text
        
        try:
            self._load_summarizer()
            
            # Truncate text if it's too long for the model
            max_token_count = 1024
            words = text.split()
            if len(words) > max_token_count:
                text = " ".join(words[:max_token_count])
            
            summary = self.summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
            return summary[0]['summary_text']
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            
            # Fallback to extractive summarization
            return self._extractive_summarize(text, sentences_count=3)
    
    def _extractive_summarize(self, text: str, sentences_count: int = 3) -> str:
        """
        Generate an extractive summary by selecting the most important sentences.
        
        Args:
            text: Text to summarize
            sentences_count: Number of sentences to include in summary
            
        Returns:
            Extractive summary
        """
        sentences = sent_tokenize(text)
        
        # For short texts, return the original
        if len(sentences) <= sentences_count:
            return text
        
        # Calculate sentence scores based on word frequency
        word_frequencies = {}
        for sentence in sentences:
            for word in word_tokenize(sentence.lower()):
                if word not in self.stop_words and word.isalnum():
                    if word not in word_frequencies:
                        word_frequencies[word] = 1
                    else:
                        word_frequencies[word] += 1
        
        # Normalize frequencies
        max_frequency = max(word_frequencies.values()) if word_frequencies else 1
        for word in word_frequencies:
            word_frequencies[word] = word_frequencies[word] / max_frequency
        
        # Score sentences
        sentence_scores = {}
        for i, sentence in enumerate(sentences):
            for word in word_tokenize(sentence.lower()):
                if word in word_frequencies:
                    if i not in sentence_scores:
                        sentence_scores[i] = word_frequencies[word]
                    else:
                        sentence_scores[i] += word_frequencies[word]
        
        # Get top sentences
        ranked_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
        top_sentence_indices = [idx for idx, _ in ranked_sentences[:sentences_count]]
        top_sentence_indices.sort()  # Preserve original order
        
        # Combine sentences
        summary = " ".join([sentences[i] for i in top_sentence_indices])
        return summary
    
    def extract_topics(self, text: str, num_topics: int = 3) -> List[Dict[str, Any]]:
        """
        Extract main topics from the text using zero-shot classification.
        
        Args:
            text: Text to analyze
            num_topics: Number of topics to extract
            
        Returns:
            List of topics with confidence scores
        """
        try:
            self._load_classifier()
            
            # Define candidate topics
            candidate_topics = [
                "business", "technology", "politics", "health", "science",
                "education", "entertainment", "sports", "environment", 
                "finance", "law", "medicine", "art", "history", "literature"
            ]
            
            # Truncate text if it's too long
            max_token_count = 1024
            words = text.split()
            if len(words) > max_token_count:
                text = " ".join(words[:max_token_count])
            
            # Run zero-shot classification
            result = self.classifier(text, candidate_topics)
            
            # Format results
            topics = []
            for i in range(min(num_topics, len(result['labels']))):
                topics.append({
                    "topic": result['labels'][i],
                    "confidence": float(result['scores'][i])
                })
            
            return topics
        except Exception as e:
            logger.error(f"Topic extraction error: {str(e)}")
            return []
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of the text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment analysis results
        """
        try:
            # Initialize sentiment analyzer
            sentiment_analyzer = pipeline("sentiment-analysis")
            
            # For long texts, analyze chunks and average results
            max_token_count = 512
            sentences = sent_tokenize(text)
            chunks = []
            current_chunk = ""
            
            for sentence in sentences:
                if len(current_chunk.split()) + len(sentence.split()) < max_token_count:
                    current_chunk += " " + sentence
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence
            
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            # Analyze each chunk
            results = []
            for chunk in chunks:
                if chunk:
                    result = sentiment_analyzer(chunk)[0]
                    results.append(result)
            
            # Aggregate results
            if not results:
                return {"label": "NEUTRAL", "score": 0.5}
            
            # Calculate weighted average for scores
            positive_score = sum(r['score'] for r in results if r['label'] == 'POSITIVE')
            negative_score = sum(r['score'] for r in results if r['label'] == 'NEGATIVE')
            
            positive_count = sum(1 for r in results if r['label'] == 'POSITIVE')
            negative_count = sum(1 for r in results if r['label'] == 'NEGATIVE')
            
            # Determine overall sentiment
            if positive_count > negative_count:
                label = "POSITIVE"
                score = positive_score / len(results)
            elif negative_count > positive_count:
                label = "NEGATIVE"
                score = negative_score / len(results)
            else:
                # If tied, use the higher score
                if positive_score >= negative_score:
                    label = "POSITIVE"
                    score = positive_score / len(results)
                else:
                    label = "NEGATIVE"
                    score = negative_score / len(results)
            
            return {
                "label": label,
                "score": float(score),
                "positive_ratio": positive_count / len(results),
                "negative_ratio": negative_count / len(results)
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return {"label": "NEUTRAL", "score": 0.5, "error": str(e)}
    
    def calculate_readability(self, text: str) -> Dict[str, Any]:
        """
        Calculate readability metrics for the text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with readability metrics
        """
        # Count sentences, words, and syllables
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        # Filter out punctuation
        words = [word for word in words if any(c.isalpha() for c in word)]
        
        if not words or not sentences:
            return {
                "flesch_reading_ease": 0,
                "flesch_kincaid_grade": 0,
                "complex_word_ratio": 0
            }
        
        word_count = len(words)
        sentence_count = len(sentences)
        
        # Count syllables (approximation)
        syllable_count = 0
        complex_words = 0
        
        for word in words:
            word = word.lower()
            syllables = self._count_syllables(word)
            syllable_count += syllables
            
            if syllables >= 3:
                complex_words += 1
        
        # Calculate Flesch Reading Ease
        if sentence_count == 0 or word_count == 0:
            flesch_reading_ease = 0
        else:
            flesch_reading_ease = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
        
        # Calculate Flesch-Kincaid Grade Level
        if sentence_count == 0 or word_count == 0:
            flesch_kincaid_grade = 0
        else:
            flesch_kincaid_grade = 0.39 * (word_count / sentence_count) + 11.8 * (syllable_count / word_count) - 15.59
        
        # Complex word ratio
        complex_word_ratio = complex_words / word_count if word_count > 0 else 0
        
        return {
            "flesch_reading_ease": round(flesch_reading_ease, 2),
            "flesch_kincaid_grade": round(flesch_kincaid_grade, 2),
            "complex_word_ratio": round(complex_word_ratio, 3),
            "avg_words_per_sentence": round(word_count / sentence_count, 2) if sentence_count > 0 else 0,
            "avg_syllables_per_word": round(syllable_count / word_count, 2) if word_count > 0 else 0
        }
    
    def _count_syllables(self, word: str) -> int:
        """
        Count the number of syllables in a word (approximate).
        
        Args:
            word: Word to count syllables for
            
        Returns:
            Number of syllables
        """
        # Remove non-alphabetic characters
        word = re.sub(r'[^a-zA-Z]', '', word.lower())
        
        if not word:
            return 0
        
        # Special cases
        if word in ['the', 'me', 'she', 'he', 'be', 'we']:
            return 1
        
        # Count vowel groups
        count = 0
        vowels = 'aeiouy'
        prev_is_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            
            if is_vowel and not prev_is_vowel:
                count += 1
            
            prev_is_vowel = is_vowel
        
        # Adjust for silent 'e' at the end
        if word.endswith('e'):
            count -= 1
        
        # Adjust for words ending with 'le'
        if word.endswith('le') and len(word) > 2 and word[-3] not in vowels:
            count += 1
        
        # Ensure at least one syllable
        return max(count, 1)


def analyze_document(text: str, options: Dict[str, bool] = None) -> Dict[str, Any]:
    """
    Convenience function to analyze document text.
    
    Args:
        text: Document text to analyze
        options: Analysis options
        
    Returns:
        Dictionary with analysis results
    """
    analyzer = DocumentAnalyzer()
    return analyzer.analyze(text, options)
