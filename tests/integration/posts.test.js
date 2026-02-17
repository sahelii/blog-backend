/**
 * Integration Tests for Posts API
 *
 * Tests the complete flow of post operations:
 * - Creating posts with/without auth
 * - Validation errors (short title, missing content)
 * - Reading posts (list, single, 404)
 * - Updating/deleting (owner); unauthorized by non-owner not yet covered
 *
 * Auth is mocked so no Firebase is required (req.uid + req.user set in test env).
 */

jest.mock('../../middleware/verifyTokenMiddleware', () => (req, res, next) => {
  // Emulate real behavior: reject when no auth token provided.
  const token = req.header('x-auth-token');
  const testUid = req.header('x-test-uid');
  if (!token && !testUid) {
    return res.status(401).json({ success: false, error: 'No token, authorization denied' });
  }
  req.uid = testUid || 'test-firebase-uid-123';
  next();
});

jest.mock('../../middleware/ensureBackendUser', () => async (req, res, next) => {
  const User = require('../../models/User');
  const u = await User.findOne({ firebase_uid: req.uid });
  if (u) req.user = u;
  next();
});

const request = require('supertest');
const app = require('../../app');
const Post = require('../../models/Post');
const User = require('../../models/User');

describe('Posts API Integration Tests', () => {
  let authToken;
  let testUser;
  let testPostId;

  beforeAll(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      firebase_uid: 'test-firebase-uid-123',
    });
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
        .set('x-auth-token', authToken)
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
        .set('x-auth-token', authToken)
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
    it('should return 403 when non-owner tries to update', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'hashed',
        firebase_uid: 'other-firebase-uid-456',
      });
      const postByTestUser = await Post.create({
        title: 'Post by Test User',
        content: 'Only test user can update this post content.',
        author: testUser._id,
      });
      const response = await request(app)
        .put(`/api/posts/${postByTestUser._id}`)
        .set('x-auth-token', authToken)
        .set('x-test-uid', otherUser.firebase_uid)
        .send({ title: 'Hacked', content: 'Should not be allowed long enough' })
        .expect(403);
      expect(response.body.success).toBe(false);
      const unchanged = await Post.findById(postByTestUser._id);
      expect(unchanged.title).toBe('Post by Test User');
    });

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
        .set('x-auth-token', authToken)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updatedData.title);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should return 403 when non-owner tries to delete', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other2@example.com',
        password: 'hashed',
        firebase_uid: 'other-firebase-uid-789',
      });
      const postByTestUser = await Post.create({
        title: 'Post Only Owner Can Delete',
        content: 'Content for delete auth test.',
        author: testUser._id,
      });
      const response = await request(app)
        .delete(`/api/posts/${postByTestUser._id}`)
        .set('x-auth-token', authToken)
        .set('x-test-uid', otherUser.firebase_uid)
        .expect(403);
      expect(response.body.success).toBe(false);
      const stillExists = await Post.findById(postByTestUser._id);
      expect(stillExists).not.toBeNull();
    });

    it('should delete a post', async () => {
      const post = await Post.create({
        title: 'Post to Delete',
        content: 'This post will be deleted',
        author: testUser._id,
      });

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('x-auth-token', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify post is deleted
      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });
  });
});
