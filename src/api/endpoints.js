import api from "./apiClient";

/**
 * API endpoints with pagination support
 * All paginated endpoints return { content: [], totalPages, totalElements, ... }
 */

// Boards API
export const boardsApi = {
  /**
   * Get user boards with pagination
   * @param {number} userId - User ID
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @returns {Promise<{content: Array, totalPages: number, totalElements: number}>}
   */
  getUserBoards: async (userId, page = 0, size = 20) => {
    const response = await api.get(`/api/boards/user/${userId}`, {
      params: { page, size },
    });
    return response.content ? response : { content: response };
  },

  /**
   * Get board by ID (returns BoardDetailDTO)
   * @param {number} boardId - Board ID
   * @returns {Promise<Object>} Board detail with nested columns and cards
   */
  getBoardById: async (boardId) => {
    return await api.get(`/api/boards/${boardId}`);
  },

  /**
   * Get all boards with pagination
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @returns {Promise<{content: Array, totalPages: number, totalElements: number}>}
   */
  getAllBoards: async (page = 0, size = 20) => {
    const response = await api.get("/api/boards", { params: { page, size } });
    return response.content ? response : { content: response };
  },

  /**
   * Create a new board
   * @param {Object} boardData - Board data
   * @returns {Promise<Object>} Created board
   */
  createBoard: async (boardData) => {
    return await api.post("/api/boards", boardData);
  },

  /**
   * Delete a board
   * @param {number} boardId - Board ID
   * @returns {Promise<void>}
   */
  deleteBoard: async (boardId) => {
    return await api.delete(`/api/boards/${boardId}`);
  },
};

// Teams API
export const teamsApi = {
  /**
   * Get all teams with pagination
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @returns {Promise<{content: Array, totalPages: number, totalElements: number}>}
   */
  getAllTeams: async (page = 0, size = 20) => {
    const response = await api.get("/api/teams", { params: { page, size } });
    return response.content ? response : { content: response };
  },

  /**
   * Get team by ID
   * @param {number} teamId - Team ID
   * @returns {Promise<Object>} Team details
   */
  getTeamById: async (teamId) => {
    return await api.get(`/api/teams/${teamId}`);
  },

  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Created team
   */
  createTeam: async (teamData) => {
    return await api.post("/api/teams", teamData);
  },

  /**
   * Get team Slack webhook URL
   * @param {number} teamId - Team ID
   * @returns {Promise<Object>} Webhook data
   */
  getSlackWebhook: async (teamId) => {
    return await api.get(`/api/teams/${teamId}/slack-webhook`);
  },

  /**
   * Update team Slack webhook URL
   * @param {number} teamId - Team ID
   * @param {Object} webhookData - Webhook data { webhookUrl: string }
   * @returns {Promise<Object>} Updated webhook data
   */
  updateSlackWebhook: async (teamId, webhookData) => {
    return await api.put(`/api/teams/${teamId}/slack-webhook`, webhookData);
  },
};

// Users API
export const usersApi = {
  /**
   * Get all users with pagination
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @returns {Promise<{content: Array, totalPages: number, totalElements: number}>}
   */
  getAllUsers: async (page = 0, size = 50) => {
    const response = await api.get("/api/users", { params: { page, size } });
    return response.content ? response : { content: response };
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User details
   */
  getUserById: async (userId) => {
    return await api.get(`/api/users/${userId}`);
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (userId, userData) => {
    return await api.put(`/api/users/${userId}`, userData);
  },
};

// Templates API (may or may not be paginated)
export const templatesApi = {
  /**
   * Get all templates
   * @returns {Promise<Array>} Templates array
   */
  getAllTemplates: async () => {
    const response = await api.get("/api/templates");
    return response.content ? response.content : response;
  },

  /**
   * Get default templates only
   * @returns {Promise<Array>} Default templates array
   */
  getDefaultTemplates: async () => {
    const response = await api.get("/api/templates/default");
    return response.content ? response.content : response;
  },

  /**
   * Get templates by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Templates array
   */
  getTemplatesByCategory: async (category) => {
    const response = await api.get(`/api/templates/category/${encodeURIComponent(category)}`);
    return response.content ? response.content : response;
  },

  /**
   * Get templates by language
   * @param {string} language - Language name
   * @returns {Promise<Array>} Templates array
   */
  getTemplatesByLanguage: async (language) => {
    const response = await api.get(`/api/templates/language/${encodeURIComponent(language)}`);
    return response.content ? response.content : response;
  },

  /**
   * Get templates by category and language
   * @param {string} category - Category name
   * @param {string} language - Language name
   * @returns {Promise<Array>} Templates array
   */
  getTemplatesByCategoryAndLanguage: async (category, language) => {
    const response = await api.get(
      `/api/templates/category/${encodeURIComponent(category)}/language/${encodeURIComponent(language)}`
    );
    return response.content ? response.content : response;
  },

  /**
   * Get template by ID
   * @param {number} templateId - Template ID
   * @returns {Promise<Object>} Template with columns
   */
  getTemplateById: async (templateId) => {
    return await api.get(`/api/templates/${templateId}`);
  },

  /**
   * Create a new template (with columns)
   * @param {Object} templateData - Template data including columns array
   * @returns {Promise<Object>} Created template
   */
  createTemplate: async (templateData) => {
    return await api.post("/api/templates", templateData);
  },

  /**
   * Update a template (with columns)
   * @param {number} templateId - Template ID
   * @param {Object} templateData - Template data including columns array
   * @returns {Promise<Object>} Updated template
   */
  updateTemplate: async (templateId, templateData) => {
    return await api.put(`/api/templates/${templateId}`, templateData);
  },

  /**
   * Delete a template
   * @param {number} templateId - Template ID
   * @returns {Promise<void>}
   */
  deleteTemplate: async (templateId) => {
    return await api.delete(`/api/templates/${templateId}`);
  },

  /**
   * Mark template as used (increment usage count)
   * @param {number} templateId - Template ID
   * @returns {Promise<void>}
   */
  useTemplate: async (templateId) => {
    return await api.post(`/api/templates/${templateId}/use`);
  },
};

// Template Columns API
export const templateColumnsApi = {
  /**
   * Get columns for a specific template
   * @param {number} templateId - Template ID
   * @returns {Promise<Array>} Template columns array
   */
  getColumnsByTemplate: async (templateId) => {
    const response = await api.get(`/api/template-columns/template/${templateId}`);
    return response.content ? response.content : response;
  },

  /**
   * Get columns by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Template columns array
   */
  getColumnsByCategory: async (category) => {
    const response = await api.get(`/api/template-columns/category/${encodeURIComponent(category)}`);
    return response.content ? response.content : response;
  },

  /**
   * Get columns by language
   * @param {string} language - Language name
   * @returns {Promise<Array>} Template columns array
   */
  getColumnsByLanguage: async (language) => {
    const response = await api.get(`/api/template-columns/language/${encodeURIComponent(language)}`);
    return response.content ? response.content : response;
  },

  /**
   * Get columns by category and language
   * @param {string} category - Category name
   * @param {string} language - Language name
   * @returns {Promise<Array>} Template columns array
   */
  getColumnsByCategoryAndLanguage: async (category, language) => {
    const response = await api.get(
      `/api/template-columns/category/${encodeURIComponent(category)}/language/${encodeURIComponent(language)}`
    );
    return response.content ? response.content : response;
  },

  /**
   * Add a new column to an existing template
   * @param {number} templateId - Template ID
   * @param {Object} columnData - Column data { name: string, position: number }
   * @returns {Promise<Object>} Created column
   */
  addColumn: async (templateId, columnData) => {
    return await api.post(`/api/template-columns/${templateId}`, columnData);
  },

  /**
   * Delete a template column
   * @param {number} columnId - Column ID
   * @returns {Promise<string>} Success message
   */
  deleteColumn: async (columnId) => {
    return await api.delete(`/api/template-columns/${columnId}`);
  },
};

// Cards API
export const cardsApi = {
  /**
   * Get cards by board ID
   * @param {number} boardId - Board ID
   * @returns {Promise<Array>} Cards array
   */
  getCardsByBoard: async (boardId) => {
    return await api.get(`/api/cards/board/${boardId}`);
  },

  /**
   * Get cards by column ID
   * @param {number} columnId - Column ID
   * @returns {Promise<Array>} Cards array
   */
  getCardsByColumn: async (columnId) => {
    return await api.get(`/api/cards/column/${columnId}`);
  },

  /**
   * Create a new card
   * @param {Object} cardData - Card data
   * @returns {Promise<Object>} Created card
   */
  createCard: async (cardData) => {
    return await api.post("/api/cards", cardData);
  },

  /**
   * Update a card
   * @param {number} cardId - Card ID
   * @param {Object} cardData - Card data to update
   * @returns {Promise<Object>} Updated card
   */
  updateCard: async (cardId, cardData) => {
    return await api.put(`/api/cards/${cardId}`, cardData);
  },

  /**
   * Delete a card
   * @param {number} cardId - Card ID
   * @returns {Promise<void>}
   */
  deleteCard: async (cardId) => {
    return await api.delete(`/api/cards/${cardId}`);
  },
};

// Columns API
export const columnsApi = {
  /**
   * Get columns by board ID
   * @param {number} boardId - Board ID
   * @returns {Promise<Array>} Columns array
   */
  getColumnsByBoard: async (boardId) => {
    return await api.get(`/api/board-columns/board/${boardId}`);
  },

  /**
   * Create a new column
   * @param {Object} columnData - Column data
   * @returns {Promise<Object>} Created column
   */
  createColumn: async (columnData) => {
    return await api.post("/api/board-columns", columnData);
  },

  /**
   * Update a column
   * @param {number} columnId - Column ID
   * @param {Object} columnData - Column data to update
   * @returns {Promise<Object>} Updated column
   */
  updateColumn: async (columnId, columnData) => {
    return await api.patch(`/api/board-columns/${columnId}`, columnData);
  },

  /**
   * Delete a column
   * @param {number} columnId - Column ID
   * @returns {Promise<void>}
   */
  deleteColumn: async (columnId) => {
    return await api.delete(`/api/board-columns/${columnId}`);
  },
};

// Votes API
export const votesApi = {
  /**
   * Get remaining votes for a user on a board
   * @param {number} boardId - Board ID
   * @param {number} userId - User ID
   * @returns {Promise<{remaining: number}>}
   */
  getRemainingVotes: async (boardId, userId) => {
    return await api.get(`/api/votes/board/${boardId}/user/${userId}/remaining`);
  },

  /**
   * Get all votes for a board
   * @param {number} boardId - Board ID
   * @returns {Promise<Array>} Votes array
   */
  getVotesByBoard: async (boardId) => {
    return await api.get(`/api/votes/board/${boardId}`);
  },

  /**
   * Cast a vote
   * @param {Object} voteData - Vote data
   * @returns {Promise<Object>} Created vote
   */
  castVote: async (voteData) => {
    return await api.post("/api/votes", voteData);
  },

  /**
   * Remove a vote
   * @param {number} voteId - Vote ID
   * @returns {Promise<void>}
   */
  removeVote: async (voteId) => {
    return await api.delete(`/api/votes/${voteId}`);
  },
};

// Comments API
export const commentsApi = {
  /**
   * Get comments by card ID
   * @param {number} cardId - Card ID
   * @returns {Promise<Array>} Comments array
   */
  getCommentsByCard: async (cardId) => {
    return await api.get(`/api/comments/card/${cardId}`);
  },

  /**
   * Create a new comment
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment
   */
  createComment: async (commentData) => {
    return await api.post("/api/comments", commentData);
  },

  /**
   * Update a comment
   * @param {number} commentId - Comment ID
   * @param {Object} commentData - Comment data to update
   * @returns {Promise<Object>} Updated comment
   */
  updateComment: async (commentId, commentData) => {
    return await api.put(`/api/comments/${commentId}`, commentData);
  },

  /**
   * Delete a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<void>}
   */
  deleteComment: async (commentId) => {
    return await api.delete(`/api/comments/${commentId}`);
  },
};

// Auth API
export const authApi = {
  /**
   * Magic login
   * @param {string} token - Magic login token
   * @returns {Promise<Object>} User data with JWT token
   */
  magicLogin: async (token) => {
    return await api.get(`/api/auth/magic-login?token=${token}`);
  },

  /**
   * Check user status by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User status
   */
  checkUserStatus: async (email) => {
    return await api.get(`/api/teams/check-user?email=${encodeURIComponent(email)}`);
  },
};
