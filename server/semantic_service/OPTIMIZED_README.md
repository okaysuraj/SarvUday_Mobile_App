# Optimized Semantic Service

This directory contains an optimized version of the semantic service that uses Ollama for embedding-based question and option mapping.

## Optimizations

The optimized service includes several improvements:

1. **Embedding Caching**
   - LRU cache for frequently used embeddings
   - Persistent in-memory cache for all generated embeddings
   - Reduces repeated API calls to Ollama

2. **Batch Processing**
   - Processes multiple embeddings in batches
   - Reduces overhead of multiple API calls
   - Improves throughput for question mapping

3. **Preloading**
   - Preloads embeddings for all questions and common options at startup
   - Ensures fast response times for initial requests
   - Reduces cold-start latency

4. **Error Handling**
   - Retry mechanism for failed Ollama API calls
   - Graceful fallback to simple text embedding when Ollama is unavailable
   - Configurable timeout and retry parameters

5. **Background Processing**
   - Worker thread for background embedding generation
   - Non-blocking API for submitting embedding requests
   - Improves responsiveness of the service

## Configuration

The service can be configured by modifying the following parameters at the top of the file:

```python
# Configuration
EMBEDDING_CACHE_SIZE = 1000  # Number of embeddings to cache
EMBEDDING_BATCH_SIZE = 5     # Number of texts to batch together
EMBEDDING_TIMEOUT = 30       # Timeout in seconds for embedding requests
EMBEDDING_RETRY_COUNT = 3    # Number of retries for failed requests
EMBEDDING_RETRY_DELAY = 1    # Delay between retries in seconds
PRELOAD_QUESTIONS = True     # Whether to preload question embeddings on startup
```

## Usage

### Starting the Service

To use the optimized service instead of the original:

1. Make sure Ollama is running with the `nomic-embed-text` model:
   ```
   ollama run nomic-embed-text
   ```

2. Start the optimized service:
   ```
   cd server/semantic_service
   python optimized_semantic_service.py
   ```

3. Update the `SEMANTIC_SERVICE_URL` in your application to point to this service.

### Testing Performance

A performance testing script is included to benchmark the service:

```
python test_performance.py
```

This will run a series of requests and generate performance metrics, including:
- Response time statistics
- Success/failure rates
- Comparison of question vs. option mapping times
- Visualizations of response time distribution

## Comparison with Original Service

The optimized service offers several advantages over the original:

1. **Faster Response Times**
   - Caching reduces repeated embedding generation
   - Preloading eliminates cold-start latency
   - Batch processing improves throughput

2. **Better Reliability**
   - Retry mechanism handles transient Ollama failures
   - Graceful fallback to simple embedding when needed
   - More robust error handling

3. **Improved Accuracy**
   - Consistent embedding generation
   - Better question-option matching
   - Stricter confidence thresholds

4. **Lower Resource Usage**
   - Fewer API calls to Ollama
   - More efficient memory usage
   - Reduced CPU load

## Monitoring

The service includes detailed logging to help monitor its performance:

- Embedding cache hit/miss rates
- Batch processing statistics
- Ollama API call latency
- Error rates and types

These logs can be used to further optimize the service for your specific workload.

## Troubleshooting

If you encounter issues with the optimized service:

1. **Ollama Connection Issues**
   - Ensure Ollama is running and accessible at `http://localhost:11434`
   - Check that the `nomic-embed-text` model is installed
   - Verify network connectivity between the service and Ollama

2. **High Latency**
   - Increase `EMBEDDING_CACHE_SIZE` for more caching
   - Enable `PRELOAD_QUESTIONS` if not already enabled
   - Adjust `EMBEDDING_BATCH_SIZE` based on your hardware

3. **Memory Usage**
   - Decrease `EMBEDDING_CACHE_SIZE` if memory usage is too high
   - Disable `PRELOAD_QUESTIONS` on memory-constrained systems
   - Consider using a smaller embedding model in Ollama