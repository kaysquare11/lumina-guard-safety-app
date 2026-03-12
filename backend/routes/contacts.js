const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');

// Get all contacts for current user
router.get('/', protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: { contacts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new contact
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, email, relationship, isPrimary } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const contact = await Contact.create({
      user: req.user._id,
      name,
      phone,
      email: email || '',
      relationship: relationship || 'other',
      isPrimary: isPrimary || false
    });

    res.status(201).json({ success: true, data: { contact } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update contact
router.put('/:id', protect, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: { contact } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete contact
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await contact.deleteOne();
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;