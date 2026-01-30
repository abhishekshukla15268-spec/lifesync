import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ==================== CATEGORIES ====================

/**
 * GET /api/categories
 * Get all categories for the current user
 */
router.get('/categories', (req, res) => {
    try {
        const categories = db.prepare(
            'SELECT id, name, color FROM categories WHERE user_id = ? ORDER BY id'
        ).all(req.user.id);

        res.json({ categories });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/categories', (req, res) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const result = db.prepare(
            'INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)'
        ).run(req.user.id, name, color || '#6366f1');

        res.status(201).json({
            category: { id: result.lastInsertRowid, name, color: color || '#6366f1' }
        });
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

/**
 * PUT /api/categories/:id
 * Update a category
 */
router.put('/categories/:id', (req, res) => {
    try {
        const { name, color } = req.body;
        const { id } = req.params;

        const existing = db.prepare(
            'SELECT id FROM categories WHERE id = ? AND user_id = ?'
        ).get(id, req.user.id);

        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }

        db.prepare(
            'UPDATE categories SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ? AND user_id = ?'
        ).run(name, color, id, req.user.id);

        const updated = db.prepare('SELECT id, name, color FROM categories WHERE id = ?').get(id);
        res.json({ category: updated });
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

/**
 * DELETE /api/categories/:id
 * Delete a category and its activities
 */
router.delete('/categories/:id', (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare(
            'DELETE FROM categories WHERE id = ? AND user_id = ?'
        ).run(id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ==================== ACTIVITIES ====================

/**
 * GET /api/activities
 * Get all activities for the current user
 */
router.get('/activities', (req, res) => {
    try {
        const activities = db.prepare(
            'SELECT id, category_id as categoryId, name, type, time, hours FROM activities WHERE user_id = ? ORDER BY id'
        ).all(req.user.id);

        res.json({ activities });
    } catch (err) {
        console.error('Get activities error:', err);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

/**
 * POST /api/activities
 * Create a new activity
 */
router.post('/activities', (req, res) => {
    try {
        const { name, categoryId, type, time, hours } = req.body;

        if (!name || !categoryId) {
            return res.status(400).json({ error: 'Name and categoryId are required' });
        }

        // Verify category belongs to user
        const category = db.prepare(
            'SELECT id FROM categories WHERE id = ? AND user_id = ?'
        ).get(categoryId, req.user.id);

        if (!category) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const result = db.prepare(
            'INSERT INTO activities (user_id, category_id, name, type, time, hours) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(req.user.id, categoryId, name, type || 'free', time || null, hours || 0);

        res.status(201).json({
            activity: {
                id: result.lastInsertRowid,
                name,
                categoryId,
                type: type || 'free',
                time: time || '',
                hours: hours || 0
            }
        });
    } catch (err) {
        console.error('Create activity error:', err);
        res.status(500).json({ error: 'Failed to create activity' });
    }
});

/**
 * PUT /api/activities/:id
 * Update an activity
 */
router.put('/activities/:id', (req, res) => {
    try {
        const { name, categoryId, type, time, hours } = req.body;
        const { id } = req.params;

        const existing = db.prepare(
            'SELECT id FROM activities WHERE id = ? AND user_id = ?'
        ).get(id, req.user.id);

        if (!existing) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // If categoryId is changing, verify new category belongs to user
        if (categoryId) {
            const category = db.prepare(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?'
            ).get(categoryId, req.user.id);

            if (!category) {
                return res.status(400).json({ error: 'Invalid category' });
            }
        }

        db.prepare(`
      UPDATE activities 
      SET name = COALESCE(?, name), 
          category_id = COALESCE(?, category_id), 
          type = COALESCE(?, type), 
          time = COALESCE(?, time),
          hours = COALESCE(?, hours)
      WHERE id = ? AND user_id = ?
    `).run(name, categoryId, type, time, hours, id, req.user.id);

        const updated = db.prepare(
            'SELECT id, category_id as categoryId, name, type, time, hours FROM activities WHERE id = ?'
        ).get(id);

        res.json({ activity: updated });
    } catch (err) {
        console.error('Update activity error:', err);
        res.status(500).json({ error: 'Failed to update activity' });
    }
});

/**
 * DELETE /api/activities/:id
 * Delete an activity
 */
router.delete('/activities/:id', (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare(
            'DELETE FROM activities WHERE id = ? AND user_id = ?'
        ).run(id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ message: 'Activity deleted' });
    } catch (err) {
        console.error('Delete activity error:', err);
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});

// ==================== LOGS ====================

/**
 * GET /api/logs
 * Get all logs for the current user
 * Query params: startDate, endDate (optional)
 */
router.get('/logs', (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = 'SELECT activity_id as activityId, date FROM logs WHERE user_id = ?';
        const params = [req.user.id];

        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY date';

        const rows = db.prepare(query).all(...params);

        // Group logs by date
        const logs = {};
        for (const row of rows) {
            if (!logs[row.date]) {
                logs[row.date] = [];
            }
            logs[row.date].push(row.activityId);
        }

        res.json({ logs });
    } catch (err) {
        console.error('Get logs error:', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

/**
 * POST /api/logs
 * Save logs for a specific date
 * Body: { date: 'YYYY-MM-DD', activityIds: [1, 2, 3] }
 */
router.post('/logs', (req, res) => {
    try {
        const { date, activityIds } = req.body;

        if (!date || !Array.isArray(activityIds)) {
            return res.status(400).json({ error: 'Date and activityIds array are required' });
        }

        // Start a transaction
        const transaction = db.transaction(() => {
            // Delete existing logs for this date
            db.prepare('DELETE FROM logs WHERE user_id = ? AND date = ?').run(req.user.id, date);

            // Insert new logs
            const insertLog = db.prepare(
                'INSERT INTO logs (user_id, activity_id, date) VALUES (?, ?, ?)'
            );

            for (const activityId of activityIds) {
                // Verify activity belongs to user
                const activity = db.prepare(
                    'SELECT id FROM activities WHERE id = ? AND user_id = ?'
                ).get(activityId, req.user.id);

                if (activity) {
                    insertLog.run(req.user.id, activityId, date);
                }
            }
        });

        transaction();

        res.json({ message: 'Logs saved', date, activityIds });
    } catch (err) {
        console.error('Save logs error:', err);
        res.status(500).json({ error: 'Failed to save logs' });
    }
});

export default router;
