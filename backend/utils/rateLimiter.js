/**
 * Rate Limiter Utility for External API Requests
 * Implements delays between requests to prevent overwhelming external services like Gemini API
 */

class RateLimiter {
  constructor() {
    this.lastRequestTime = 0;
    this.minDelay = 2000; // 2 seconds minimum delay between requests
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Add delay between requests to external APIs
   * @param {number} customDelay - Custom delay in milliseconds (optional)
   */
  async delay(customDelay = null) {
    const delayTime = customDelay || this.minDelay;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < delayTime) {
      const waitTime = delayTime - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Execute a function with rate limiting
   * @param {Function} fn - Function to execute
   * @param {any[]} args - Arguments to pass to the function
   * @param {number} customDelay - Custom delay for this request
   */
  async executeWithRateLimit(fn, args = [], customDelay = null) {
    await this.delay(customDelay);
    return await fn(...args);
  }

  /**
   * Queue multiple requests for sequential execution with delays
   * @param {Array} requests - Array of {fn, args, delay} objects
   */
  async queueRequests(requests) {
    const results = [];
    
    for (const request of requests) {
      try {
        const result = await this.executeWithRateLimit(
          request.fn,
          request.args || [],
          request.delay
        );
        results.push({ success: true, data: result });
      } catch (error) {
        console.error('Rate limited request failed:', error);
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Batch process requests with exponential backoff for failures
   * @param {Array} requests - Array of request objects
   * @param {number} batchSize - Number of requests to process in parallel
   */
  async batchProcess(requests, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(async (request, index) => {
        try {
          // Stagger requests within batch
          await this.delay(index * 500);
          return await this.executeWithRateLimit(request.fn, request.args);
        } catch (error) {
          console.error(`Batch request ${i + index} failed:`, error);
          return { error: error.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Longer delay between batches
      if (i + batchSize < requests.length) {
        await this.delay(5000);
      }
    }
    
    return results;
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

module.exports = rateLimiter;