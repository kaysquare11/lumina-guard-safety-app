// ============================================
// SOS ROUTES - LUMINA GUARD
// routes/sos.js
// ============================================

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');
const { sendSOSAlert } = require('../services/emailService');

// All routes are protected (require authentication)
router.use(protect);

// ============================================
// ROUTE: POST /api/sos/trigger
// Purpose: Trigger an SOS alert with email notifications
// Access: Private (authenticated users)
// ============================================
router.post('/trigger', async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;

    // 1. Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide location coordinates'
      });
    }

    // 2. Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // 3. Create SOS alert
    const alert = await Alert.create({
      user: req.user.id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
      },
      message: message || 'Emergency SOS triggered',
      alertType: 'sos',
      status: 'active'
    });

    // 4. Populate user information
    await alert.populate('user', 'name email phone');

    // 5. Send email notifications to emergency contacts
    try {
      const contacts = await Contact.find({ user: req.user.id });

      if (contacts.length > 0) {
        console.log(`📧 Sending SOS emails to ${contacts.length} emergency contacts...`);

        for (const contact of contacts) {
          if (contact.email) {
            await sendSOSAlert(
              contact.email,
              req.user.name,
              { latitude, longitude }
            );
            console.log(`✅ Email sent to: ${contact.name} (${contact.email})`);
          } else {
            console.log(`⚠️ Skipping ${contact.name} - no email provided`);
          }
        }

        console.log('✅ All SOS notification emails sent successfully');
      } else {
        console.log('⚠️ No emergency contacts found for this user');
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail the SOS if email fails - alert is still created
    }

    // 6. Send response
    res.status(201).json({
      success: true,
      message: 'SOS alert created successfully',
      data: {
        alert: {
          id: alert._id,
          user: alert.user,
          location: {
            latitude: alert.location.coordinates[1],
            longitude: alert.location.coordinates[0]
          },
          message: alert.message,
          status: alert.status,
          createdAt: alert.createdAt
        }
      }
    });

  } catch (error) {
    console.error('❌ SOS trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SOS alert',
      error: error.message
    });
  }
});

// ============================================
// ROUTE: GET /api/sos/my-alerts
// Purpose: Get all alerts for the logged-in user
// Access: Private
// ============================================
router.get('/my-alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: {
        alerts: alerts.map(alert => ({
          id: alert._id,
          location: {
            latitude: alert.location.coordinates[1],
            longitude: alert.location.coordinates[0]
          },
          message: alert.message,
          status: alert.status,
          createdAt: alert.createdAt,
          resolvedAt: alert.resolvedAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Fetch alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// ============================================
// ROUTE: GET /api/sos/active
// Purpose: Get all active alerts (for admin/real-time tracking)
// Access: Private
// ============================================
router.get('/active', async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'active' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: {
        alerts: alerts.map(alert => ({
          id: alert._id,
          user: alert.user,
          location: {
            latitude: alert.location.coordinates[1],
            longitude: alert.location.coordinates[0]
          },
          locationHistory: alert.locationHistory?.map(loc => ({
            latitude: loc.coordinates[1],
            longitude: loc.coordinates[0],
            timestamp: loc.timestamp
          })) || [],
          message: alert.message,
          status: alert.status,
          createdAt: alert.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Fetch active alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active alerts',
      error: error.message
    });
  }
});

// ============================================
// ROUTE: PUT /api/sos/:id/location
// Purpose: Update location for real-time tracking
// Access: Private
// ============================================
router.put('/:id/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const alertId = req.params.id;

    // 1. Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide location coordinates'
      });
    }

    // 2. Find alert
    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // 3. Check if user owns this alert
    if (alert.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this alert'
      });
    }

    // 4. Update location (if your Alert model has this method)
    if (alert.addLocationUpdate) {
      await alert.addLocationUpdate(latitude, longitude);
    } else {
      // Fallback: update location directly
      alert.location.coordinates = [longitude, latitude];
      await alert.save();
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        alertId: alert._id,
        location: { latitude, longitude }
      }
    });

  } catch (error) {
    console.error('❌ Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// ============================================
// ROUTE: PUT /api/sos/:id/resolve
// Purpose: Mark an alert as resolved
// Access: Private
// ============================================
router.put('/:id/resolve', async (req, res) => {
  try {
    const { notes } = req.body;
    const alertId = req.params.id;

    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if user owns this alert
    if (alert.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this alert'
      });
    }

    // Update status (if your Alert model has this method)
    if (alert.updateStatus) {
      await alert.updateStatus('resolved', notes);
    } else {
      // Fallback: update status directly
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      if (notes) alert.notes = notes;
      await alert.save();
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      data: {
        alert: {
          id: alert._id,
          status: alert.status,
          resolvedAt: alert.resolvedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
});


// Get user's SOS alert history
router.get('/history', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Error fetching alert history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single alert details
router.get('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ success: true, alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;