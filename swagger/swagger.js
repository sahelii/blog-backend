const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StoryHub API',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for a modern blog platform built with Node.js, Express, and MongoDB.',
      contact: {
        name: 'API Support',
        email: 'support@storyhub.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://blog-backend-2-5hun.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter Firebase ID Token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL',
              example: 'https://example.com/avatar.jpg',
              nullable: true,
            },
            firebase_uid: {
              type: 'string',
              description: 'Firebase user ID',
              example: 'firebase-uid-123',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Post ID',
              example: '507f1f77bcf86cd799439011',
            },
            title: {
              type: 'string',
              description: 'Post title',
              example: 'Getting Started with Node.js',
              minLength: 3,
              maxLength: 200,
            },
            content: {
              type: 'string',
              description: 'Post content (markdown supported)',
              example: 'This is a comprehensive guide to Node.js...',
              minLength: 10,
              maxLength: 10000,
            },
            author: {
              $ref: '#/components/schemas/User',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Post featured image URL',
              nullable: true,
            },
            imageType: {
              type: 'string',
              description: 'Image MIME type',
              example: 'image/jpeg',
              nullable: true,
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Post tags',
              example: ['nodejs', 'backend', 'tutorial'],
            },
            comments: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Comment',
              },
              description: 'Post comments',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Post creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Comment ID',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            post: {
              type: 'string',
              description: 'Post ID',
              example: '507f1f77bcf86cd799439011',
            },
            comment: {
              type: 'string',
              description: 'Comment text',
              example: 'Great article! Very helpful.',
              minLength: 1,
              maxLength: 1000,
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Comment creation date',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
              nullable: true,
            },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Post',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'integer',
                  example: 1,
                },
                totalPages: {
                  type: 'integer',
                  example: 10,
                },
                totalItems: {
                  type: 'integer',
                  example: 100,
                },
                itemsPerPage: {
                  type: 'integer',
                  example: 10,
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true,
                },
                hasPrevPage: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management',
      },
      {
        name: 'Posts',
        description: 'Blog post CRUD operations',
      },
      {
        name: 'Comments',
        description: 'Comment management',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };
