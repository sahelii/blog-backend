const paginate = (model, populateOptions = []) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query from query params
    const query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    try {
      const total = await model.countDocuments(query);
      let queryBuilder = model.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ date: -1 });
      
      // Apply populate options
      populateOptions.forEach(populate => {
        queryBuilder = queryBuilder.populate(populate);
      });
      
      const results = await queryBuilder;
      
      res.paginatedResults = {
        success: true,
        data: results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = paginate;
