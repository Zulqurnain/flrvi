/**
 * Theme Management API Routes
 * Handles UI/theme configurations for all platforms (website, mobile apps, admin panel)
 */

const express = require('express');
const { getPb } = require('../../db/pocketbase');
const { adminAuth, PERMISSIONS } = require('../../middleware/adminAuth');
const router = express.Router();

// Get active theme for a platform
router.get('/active/:platform', async (req, res) => {
  try {
    const pb = getPb();
    const { platform } = req.params;
    
    const theme = await pb.collection('ui_themes').getFirstListItem(
      `platform = "${platform}" && is_active = true`,
      {
        expand: 'created_by'
      }
    );

    res.json({
      success: true,
      theme: {
        id: theme.id,
        theme_name: theme.theme_name,
        platform: theme.platform,
        colors: {
          primary: theme.primary_color,
          secondary: theme.secondary_color,
          background: theme.background_color,
          text: theme.text_color,
          accent: theme.accent_color
        },
        background_image: theme.background_image ? pb.files.getUrl(theme, theme.background_image) : null,
        custom_css: theme.custom_css,
        created_by: theme.expand?.created_by?.username || 'System'
      }
    });
  } catch (error) {
    console.error('Error fetching active theme:', error);
    res.status(404).json({
      success: false,
      message: 'No active theme found for this platform'
    });
  }
});

// Get all themes for a platform (admin only)
router.get('/platform/:platform', adminAuth([PERMISSIONS.MANAGE_THEMES]), async (req, res) => {
  try {
    const pb = getPb();
    const { platform } = req.params;
    
    const themes = await pb.collection('ui_themes').getFullList({
      filter: `platform = "${platform}" || platform = "all"`,
      sort: '-created',
      expand: 'created_by'
    });

    const formattedThemes = themes.map(theme => ({
      id: theme.id,
      theme_name: theme.theme_name,
      platform: theme.platform,
      colors: {
        primary: theme.primary_color,
        secondary: theme.secondary_color,
        background: theme.background_color,
        text: theme.text_color,
        accent: theme.accent_color
      },
      background_image: theme.background_image ? pb.files.getUrl(theme, theme.background_image) : null,
      custom_css: theme.custom_css,
      is_active: theme.is_active,
      created: theme.created,
      updated: theme.updated,
      created_by: theme.expand?.created_by?.username || 'System'
    }));

    res.json({
      success: true,
      themes: formattedThemes,
      count: formattedThemes.length
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch themes'
    });
  }
});

// Create new theme (admin only)
router.post('/', adminAuth([PERMISSIONS.MANAGE_THEMES]), async (req, res) => {
  try {
    const pb = getPb();
    const {
      theme_name,
      platform,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      custom_css,
      is_active
    } = req.body;

    // Validate required fields
    if (!theme_name || !platform || !primary_color || !secondary_color || !background_color || !text_color) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate color format
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    const colors = [primary_color, secondary_color, background_color, text_color];
    if (accent_color) colors.push(accent_color);
    
    for (const color of colors) {
      if (!colorRegex.test(color)) {
        return res.status(400).json({
          success: false,
          message: `Invalid color format: ${color}. Use hex format like #FF0000`
        });
      }
    }

    // If this theme should be active, deactivate others for the same platform
    if (is_active) {
      await pb.collection('ui_themes').getFullList({
        filter: `platform = "${platform}" && is_active = true`
      }).then(activeThemes => {
        return Promise.all(
          activeThemes.map(theme => 
            pb.collection('ui_themes').update(theme.id, { is_active: false })
          )
        );
      });
    }

    const themeData = {
      theme_name,
      platform,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color: accent_color || null,
      custom_css: custom_css || '',
      is_active: is_active || false,
      created_by: req.adminUser.id
    };

    const newTheme = await pb.collection('ui_themes').create(themeData);

    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      theme: {
        id: newTheme.id,
        theme_name: newTheme.theme_name,
        platform: newTheme.platform,
        colors: {
          primary: newTheme.primary_color,
          secondary: newTheme.secondary_color,
          background: newTheme.background_color,
          text: newTheme.text_color,
          accent: newTheme.accent_color
        },
        custom_css: newTheme.custom_css,
        is_active: newTheme.is_active
      }
    });

  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create theme'
    });
  }
});

// Update theme (admin only)
router.put('/:id', adminAuth([PERMISSIONS.MANAGE_THEMES]), async (req, res) => {
  try {
    const pb = getPb();
    const { id } = req.params;
    const updates = req.body;

    // Validate color formats if provided
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    const colorFields = ['primary_color', 'secondary_color', 'background_color', 'text_color', 'accent_color'];
    
    for (const field of colorFields) {
      if (updates[field] && !colorRegex.test(updates[field])) {
        return res.status(400).json({
          success: false,
          message: `Invalid color format for ${field}: ${updates[field]}`
        });
      }
    }

    // Get current theme to check platform
    const currentTheme = await pb.collection('ui_themes').getOne(id);

    // If making this theme active, deactivate others
    if (updates.is_active === true) {
      await pb.collection('ui_themes').getFullList({
        filter: `platform = "${currentTheme.platform}" && is_active = true && id != "${id}"`
      }).then(activeThemes => {
        return Promise.all(
          activeThemes.map(theme => 
            pb.collection('ui_themes').update(theme.id, { is_active: false })
          )
        );
      });
    }

    const updatedTheme = await pb.collection('ui_themes').update(id, updates);

    res.json({
      success: true,
      message: 'Theme updated successfully',
      theme: {
        id: updatedTheme.id,
        theme_name: updatedTheme.theme_name,
        platform: updatedTheme.platform,
        colors: {
          primary: updatedTheme.primary_color,
          secondary: updatedTheme.secondary_color,
          background: updatedTheme.background_color,
          text: updatedTheme.text_color,
          accent: updatedTheme.accent_color
        },
        custom_css: updatedTheme.custom_css,
        is_active: updatedTheme.is_active
      }
    });

  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update theme'
    });
  }
});

// Delete theme (admin only)
router.delete('/:id', adminAuth([PERMISSIONS.MANAGE_THEMES]), async (req, res) => {
  try {
    const pb = getPb();
    const { id } = req.params;

    await pb.collection('ui_themes').delete(id);

    res.json({
      success: true,
      message: 'Theme deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete theme'
    });
  }
});

// Activate theme (admin only)
router.post('/:id/activate', adminAuth([PERMISSIONS.MANAGE_THEMES]), async (req, res) => {
  try {
    const pb = getPb();
    const { id } = req.params;

    // Get the theme to activate
    const theme = await pb.collection('ui_themes').getOne(id);

    // Deactivate all other themes for this platform
    await pb.collection('ui_themes').getFullList({
      filter: `platform = "${theme.platform}" && is_active = true`
    }).then(activeThemes => {
      return Promise.all(
        activeThemes.map(activeTheme => 
          pb.collection('ui_themes').update(activeTheme.id, { is_active: false })
        )
      );
    });

    // Activate the selected theme
    const activatedTheme = await pb.collection('ui_themes').update(id, { is_active: true });

    res.json({
      success: true,
      message: `Theme "${activatedTheme.theme_name}" activated for ${activatedTheme.platform}`,
      theme: {
        id: activatedTheme.id,
        theme_name: activatedTheme.theme_name,
        platform: activatedTheme.platform,
        is_active: activatedTheme.is_active
      }
    });

  } catch (error) {
    console.error('Error activating theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate theme'
    });
  }
});

// Upload background image for theme (admin only)
router.post('/:id/background', adminAuth([PERMISSIONS.MANAGE_THEMES]), async (req, res) => {
  try {
    const pb = getPb();
    const { id } = req.params;

    if (!req.files || !req.files.background_image) {
      return res.status(400).json({
        success: false,
        message: 'No background image uploaded'
      });
    }

    const formData = new FormData();
    formData.append('background_image', req.files.background_image.data);

    const updatedTheme = await pb.collection('ui_themes').update(id, formData);
    const imageUrl = pb.files.getUrl(updatedTheme, updatedTheme.background_image);

    res.json({
      success: true,
      message: 'Background image updated successfully',
      image_url: imageUrl
    });

  } catch (error) {
    console.error('Error uploading background image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload background image'
    });
  }
});

// Get theme preview CSS (public endpoint)
router.get('/:id/preview-css', async (req, res) => {
  try {
    const pb = getPb();
    const { id } = req.params;

    const theme = await pb.collection('ui_themes').getOne(id);

    const css = `
      :root {
        --primary-color: ${theme.primary_color};
        --secondary-color: ${theme.secondary_color};
        --background-color: ${theme.background_color};
        --text-color: ${theme.text_color};
        --accent-color: ${theme.accent_color || theme.primary_color};
      }
      
      ${theme.custom_css || ''}
    `;

    res.setHeader('Content-Type', 'text/css');
    res.send(css);

  } catch (error) {
    console.error('Error generating preview CSS:', error);
    res.status(500).send('/* Error generating CSS */');
  }
});

module.exports = router;