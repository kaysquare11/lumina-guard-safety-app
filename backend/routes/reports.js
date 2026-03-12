const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, imageUrl, isAnonymous, severity } = req.body;

    // Validation
    if (!title || !description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and location'
      });
    }

    // Create report
    const report = await Report.create({
      user: req.user._id,
      title,
      description,
      category: category || 'other',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address || ''
      },
      imageUrl: imageUrl || '',
      isAnonymous: isAnonymous || false,
      severity: severity || 'medium'
    });

    // Populate user details (if not anonymous)
    await report.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, severity } = req.query;
    
    // Build query
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (severity) query.severity = severity;

    const reports = await Report.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: reports.length,
      data: {
        reports
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// @route   GET /api/reports/my-reports
// @desc    Get current user's reports
// @access  Private
router.get('/my-reports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: {
        reports
      }
    });

  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reports',
      error: error.message
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get single report by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update report status (admin feature for future)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns the report
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    report.status = status || report.status;
    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns the report
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
});

// @route   GET /api/reports/nearby/:latitude/:longitude
// @desc    Get reports near a location
// @access  Private
router.get('/nearby/:latitude/:longitude', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const maxDistance = req.query.distance || 5000; // 5km default

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .populate('user', 'name')
    .limit(50);

    res.json({
      success: true,
      count: reports.length,
      data: {
        reports
      }
    });

  } catch (error) {
    console.error('Get nearby reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby reports',
      error: error.message
    });
  }
});

module.exports = router;