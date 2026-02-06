/**
 * Integration Tests for Posts API
 * 
 * Tests the complete flow of post operations:
 * - Creating posts
 * - Reading posts
 * - Updating posts
 * - Deleting posts
 * - Authorization checks
 */

const request = require('supertest');
const app = require('../../app');
const Post = require('../../models/Post');
const User = require('../../models/User');

describe('Posts API Integration Tests', () => {
  let authToken;
  let testUser;
  let testPostId;

  beforeAll(async () => {
    // Create test user and get auth token
    // This would typically involve Firebase Admin SDK for testing
    // For now, we'll mock this
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      firebase_uid: 'test-firebase-uid-123',
    });

    // In a real scenario, you'd get a token from Firebase
    // For testing, you might need to mock the token verification middleware
    authToken = 'mock-auth-token';
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content that is long enough to pass validation.',
        tags: ['test', 'example'],
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.content).toBe(postData.content);
      testPostId = response.body.data._id;
    });

    it('should reject post creation without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'Test', content: 'Test content' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject post with invalid data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'AB', content: 'Short' }) // Too short
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts with pagination', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should search posts by query', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ search: 'Test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get a single post by ID', async () => {
      if (!testPostId) {
        // Create a post first if testPostId is not set
        const post = await Post.create({
          title: 'Test Post',
          content: 'Test content for single post retrieval',
          author: testUser._id,
        });
        testPostId = post._id;
      }

      const response = await request(app)
        .get(`/api/posts/${testPostId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPostId.toString());
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post', async () => {
      if (!testPostId) {
        const post = await Post.create({
          title: 'Test Post',
          content: 'Original content',
          author: testUser._id,
        });
        testPostId = post._id;
      }

      const updatedData = {
        title: 'Updated Title',
        content: 'Updated content that is long enough',
      };

      const response = await request(app)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updatedData.title);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const post = await Post.create({
        title: 'Post to Delete',
        content: 'This post will be deleted',
        author: testUser._id,
      });

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify post is deleted
      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });
  });
});
